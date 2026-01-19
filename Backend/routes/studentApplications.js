const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendApplicationStatusEmail, sendNewApplicationNotification } = require('../utils/emailService');

// Multer storage configuration for application documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'documents');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs only
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'));
  }
});

// Get all applications for the logged-in student
router.get('/applications', authMiddleware.authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT 
        sa.*,
        s.name as school_name,
        s.location as school_location,
        s.type as school_type,
        s.level as school_level,
        s.image_urls as school_images
      FROM student_applications sa
      JOIN schools s ON sa.school_id = s.id
      WHERE sa.user_id = $1
      ORDER BY sa.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching applications:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get a specific application by ID
router.get('/applications/:id', authMiddleware.authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT 
        sa.*,
        s.name as school_name,
        s.location as school_location,
        s.type as school_type,
        s.level as school_level,
        s.image_urls as school_images
      FROM student_applications sa
      JOIN schools s ON sa.school_id = s.id
      WHERE sa.id = $1 AND sa.user_id = $2
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching application:', err.message);
    res.status(500).send('Server Error');
  }
});

// Create a new application with document uploads
router.post('/applications', authMiddleware.authMiddleware, upload.array('documents', 5), async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      school_id,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      current_grade,
      desired_grade,
      previous_school,
      parent_name,
      parent_email,
      parent_phone,
      address,
      additional_info
    } = req.body;

    // Check if user already has an application for this school
    const existingApp = await pool.query(
      'SELECT * FROM student_applications WHERE user_id = $1 AND school_id = $2',
      [userId, school_id]
    );

    if (existingApp.rows.length > 0) {
      return res.status(400).json({ message: 'You have already applied to this school' });
    }

    // Verify school exists and get school leader info
    const schoolCheck = await pool.query(`
      SELECT s.*, u.email as leader_email, u.first_name as leader_first_name
      FROM schools s
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = $1
    `, [school_id]);
    
    if (schoolCheck.rows.length === 0) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Process uploaded documents
    const documentUrls = (req.files || []).map((file) => `/uploads/documents/${file.filename}`);

    const result = await pool.query(`
      INSERT INTO student_applications (
        user_id, school_id, first_name, last_name, email, phone,
        date_of_birth, current_grade, desired_grade, previous_school,
        parent_name, parent_email, parent_phone, address, additional_info, document_urls
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      userId, school_id, first_name, last_name, email, phone,
      date_of_birth || null, current_grade || null, desired_grade || null, previous_school || null,
      parent_name || null, parent_email || null, parent_phone || null, address || null, additional_info || null,
      documentUrls.length ? JSON.stringify(documentUrls) : null
    ]);

    // Get school info for response
    const schoolInfo = schoolCheck.rows[0];

    // Send notification to school leader
    if (schoolInfo.leader_email) {
      await sendNewApplicationNotification(
        schoolInfo.leader_email,
        `${first_name} ${last_name}`,
        schoolInfo.name
      );
    }

    res.status(201).json({
      ...result.rows[0],
      school_name: schoolInfo.name,
      school_location: schoolInfo.location
    });
  } catch (err) {
    console.error('Error creating application:', err.message);
    if (err.code === '23505') { // Unique constraint violation
      return res.status(400).json({ message: 'You have already applied to this school' });
    }
    res.status(500).send('Server Error');
  }
});

// Update application status (admin only, but we'll allow students to withdraw)
router.put('/applications/:id', authMiddleware.authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, additional_info } = req.body;

    // Check if application exists and belongs to user
    const appCheck = await pool.query(
      'SELECT * FROM student_applications WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (appCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Students can only withdraw their own applications
    // Admins can update status (handled separately if needed)
    if (status && status !== 'withdrawn') {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can change application status' });
      }
    }

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      updateFields.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (additional_info !== undefined) {
      updateFields.push(`additional_info = $${paramCount++}`);
      values.push(additional_info);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, userId);

    const result = await pool.query(`
      UPDATE student_applications
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `, values);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating application:', err.message);
    res.status(500).send('Server Error');
  }
});

// Delete/withdraw an application
router.delete('/applications/:id', authMiddleware.authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if application exists and belongs to user
    const appCheck = await pool.query(
      'SELECT * FROM student_applications WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (appCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    await pool.query('DELETE FROM student_applications WHERE id = $1 AND user_id = $2', [id, userId]);

    res.json({ message: 'Application withdrawn successfully' });
  } catch (err) {
    console.error('Error deleting application:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get all applications for a school (admin only)
router.get('/schools/:schoolId/applications', authMiddleware.authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { schoolId } = req.params;

    const result = await pool.query(`
      SELECT 
        sa.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        s.name as school_name
      FROM student_applications sa
      JOIN users u ON sa.user_id = u.id
      JOIN schools s ON sa.school_id = s.id
      WHERE sa.school_id = $1
      ORDER BY sa.created_at DESC
    `, [schoolId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching school applications:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get all applications for schools created by the logged-in leader
router.get('/leader/applications', authMiddleware.authMiddleware, async (req, res) => {
  try {
    // Only leaders can access this endpoint
    if (req.user.role !== 'leader' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Leader access required' });
    }

    const userId = req.user.id;

    // Get all applications for schools created by this leader
    const result = await pool.query(`
      SELECT 
        sa.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        s.name as school_name,
        s.location as school_location,
        s.type as school_type,
        s.level as school_level,
        reviewer.first_name as reviewer_first_name,
        reviewer.last_name as reviewer_last_name
      FROM student_applications sa
      JOIN users u ON sa.user_id = u.id
      JOIN schools s ON sa.school_id = s.id
      LEFT JOIN users reviewer ON sa.reviewed_by = reviewer.id
      WHERE s.created_by = $1
      ORDER BY sa.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leader applications:', err.message);
    res.status(500).send('Server Error');
  }
});

// Approve an application (leader only)
router.post('/leader/applications/:id/approve', authMiddleware.authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Only leaders can approve
    if (req.user.role !== 'leader' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Leader access required' });
    }

    // Verify the application belongs to a school created by this leader
    const appCheck = await pool.query(`
      SELECT sa.*, s.name as school_name, s.created_by, u.email as student_email
      FROM student_applications sa
      JOIN schools s ON sa.school_id = s.id
      JOIN users u ON sa.user_id = u.id
      WHERE sa.id = $1
    `, [id]);

    if (appCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const application = appCheck.rows[0];

    // Check if leader owns this school (admins can approve any)
    if (req.user.role === 'leader' && application.created_by !== userId) {
      return res.status(403).json({ message: 'You can only approve applications for your own schools' });
    }

    // Update application status
    const result = await pool.query(`
      UPDATE student_applications
      SET status = 'approved',
          reviewed_by = $1,
          reviewed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [userId, id]);

    // Send email notification
    await sendApplicationStatusEmail({
      ...result.rows[0],
      school_name: application.school_name,
      email: application.student_email
    }, 'approved');

    res.json({
      ...result.rows[0],
      message: 'Application approved successfully'
    });
  } catch (err) {
    console.error('Error approving application:', err.message);
    res.status(500).send('Server Error');
  }
});

// Reject an application (leader only)
router.post('/leader/applications/:id/reject', authMiddleware.authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const userId = req.user.id;

    // Only leaders can reject
    if (req.user.role !== 'leader' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Leader access required' });
    }

    if (!rejection_reason || rejection_reason.trim() === '') {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    // Verify the application belongs to a school created by this leader
    const appCheck = await pool.query(`
      SELECT sa.*, s.name as school_name, s.created_by, u.email as student_email
      FROM student_applications sa
      JOIN schools s ON sa.school_id = s.id
      JOIN users u ON sa.user_id = u.id
      WHERE sa.id = $1
    `, [id]);

    if (appCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const application = appCheck.rows[0];

    // Check if leader owns this school (admins can reject any)
    if (req.user.role === 'leader' && application.created_by !== userId) {
      return res.status(403).json({ message: 'You can only reject applications for your own schools' });
    }

    // Update application status
    const result = await pool.query(`
      UPDATE student_applications
      SET status = 'rejected',
          rejection_reason = $1,
          reviewed_by = $2,
          reviewed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [rejection_reason, userId, id]);

    // Send email notification
    await sendApplicationStatusEmail({
      ...result.rows[0],
      school_name: application.school_name,
      email: application.student_email
    }, 'rejected', rejection_reason);

    res.json({
      ...result.rows[0],
      message: 'Application rejected'
    });
  } catch (err) {
    console.error('Error rejecting application:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
