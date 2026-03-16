const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const { createNotification } = require('./notifications');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/scholarships';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'scholarship-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and image files are allowed'));
    }
  }
});

// Get all scholarships (public, with filters)
router.get('/scholarships', async (req, res) => {
  try {
    const { school_id, status, min_amount, max_amount } = req.query;

    let query = `
      SELECT s.*, sc.name as school_name,
             (SELECT COUNT(*) FROM scholarship_applications WHERE scholarship_id = s.id) as application_count
      FROM scholarships s
      LEFT JOIN schools sc ON s.school_id = sc.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (school_id) {
      paramCount++;
      query += ` AND s.school_id = $${paramCount}`;
      params.push(school_id);
    }
    if (status) {
      paramCount++;
      query += ` AND s.status = $${paramCount}`;
      params.push(status);
    } else {
      // Default to only active scholarships for public view
      query += ` AND s.status = 'active'`;
    }
    if (min_amount) {
      paramCount++;
      query += ` AND s.amount >= $${paramCount}`;
      params.push(min_amount);
    }
    if (max_amount) {
      paramCount++;
      query += ` AND s.amount <= $${paramCount}`;
      params.push(max_amount);
    }

    query += ' ORDER BY s.application_deadline ASC NULLS LAST, s.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching scholarships:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get single scholarship
router.get('/scholarships/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT s.*, sc.name as school_name, u.first_name as creator_first_name, u.last_name as creator_last_name,
              (SELECT COUNT(*) FROM scholarship_applications WHERE scholarship_id = s.id) as application_count
       FROM scholarships s
       LEFT JOIN schools sc ON s.school_id = sc.id
       LEFT JOIN users u ON s.created_by = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching scholarship:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create scholarship (leaders and admins)
router.post('/scholarships', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Only leaders and admins can create scholarships' });
    }

    const {
      school_id,
      title,
      description,
      amount,
      currency,
      coverage_type,
      eligibility_criteria,
      required_documents,
      application_deadline,
      start_date,
      end_date,
      total_slots,
      status
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const result = await pool.query(
      `INSERT INTO scholarships (school_id, title, description, amount, currency, coverage_type, eligibility_criteria, required_documents, application_deadline, start_date, end_date, total_slots, remaining_slots, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12, $13, $14)
       RETURNING *`,
      [school_id, title, description, amount, currency || 'RWF', coverage_type, eligibility_criteria, required_documents, application_deadline, start_date, end_date, total_slots, status || 'active', req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating scholarship:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update scholarship
router.put('/scholarships/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const {
      title,
      description,
      amount,
      currency,
      coverage_type,
      eligibility_criteria,
      required_documents,
      application_deadline,
      start_date,
      end_date,
      total_slots,
      remaining_slots,
      status
    } = req.body;

    // Check if user created this scholarship (unless admin)
    if (req.user.role !== 'admin') {
      const check = await pool.query('SELECT * FROM scholarships WHERE id = $1 AND created_by = $2', [id, req.user.id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Scholarship not found or access denied' });
      }
    }

    const result = await pool.query(
      `UPDATE scholarships 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           amount = COALESCE($3, amount),
           currency = COALESCE($4, currency),
           coverage_type = COALESCE($5, coverage_type),
           eligibility_criteria = COALESCE($6, eligibility_criteria),
           required_documents = COALESCE($7, required_documents),
           application_deadline = COALESCE($8, application_deadline),
           start_date = COALESCE($9, start_date),
           end_date = COALESCE($10, end_date),
           total_slots = COALESCE($11, total_slots),
           remaining_slots = COALESCE($12, remaining_slots),
           status = COALESCE($13, status),
           updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [title, description, amount, currency, coverage_type, eligibility_criteria, required_documents, application_deadline, start_date, end_date, total_slots, remaining_slots, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating scholarship:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete scholarship
router.delete('/scholarships/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;

    if (req.user.role !== 'admin') {
      const check = await pool.query('SELECT * FROM scholarships WHERE id = $1 AND created_by = $2', [id, req.user.id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Scholarship not found or access denied' });
      }
    }

    await pool.query('DELETE FROM scholarships WHERE id = $1', [id]);
    res.json({ message: 'Scholarship deleted successfully' });
  } catch (err) {
    console.error('Error deleting scholarship:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Apply for scholarship (students)
router.post('/scholarships/:id/apply', authMiddleware, upload.array('documents', 5), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can apply for scholarships' });
    }

    const { id } = req.params;
    const { application_essay, financial_need_statement } = req.body;

    // Check if scholarship exists and is active
    const scholarship = await pool.query('SELECT * FROM scholarships WHERE id = $1 AND status = $2', [id, 'active']);
    if (scholarship.rows.length === 0) {
      return res.status(404).json({ message: 'Scholarship not found or not accepting applications' });
    }

    // Check if slots are available
    if (scholarship.rows[0].remaining_slots !== null && scholarship.rows[0].remaining_slots <= 0) {
      return res.status(400).json({ message: 'No slots remaining for this scholarship' });
    }

    // Process uploaded documents
    const documentUrls = req.files ? req.files.map(file => `/uploads/scholarships/${file.filename}`) : [];

    const result = await pool.query(
      `INSERT INTO scholarship_applications (scholarship_id, student_user_id, application_essay, supporting_documents, financial_need_statement, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [id, req.user.id, application_essay, JSON.stringify(documentUrls), financial_need_statement]
    );

    // Decrement remaining slots
    if (scholarship.rows[0].remaining_slots !== null) {
      await pool.query(
        'UPDATE scholarships SET remaining_slots = remaining_slots - 1 WHERE id = $1',
        [id]
      );
    }

    // Send notification to scholarship creator
    try {
      const creatorId = scholarship.rows[0].created_by;
      if (creatorId) {
        await createNotification(
          creatorId,
          'New Scholarship Application',
          `A student has applied for the "${scholarship.rows[0].title}" scholarship`,
          'info',
          '/leader'
        );
      }
    } catch (notifErr) {
      console.error('Failed to send notification:', notifErr.message);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error applying for scholarship:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get student's scholarship applications
router.get('/scholarship-applications/my-applications', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT sa.*, s.title as scholarship_title, s.amount, s.currency, sc.name as school_name
       FROM scholarship_applications sa
       LEFT JOIN scholarships s ON sa.scholarship_id = s.id
       LEFT JOIN schools sc ON s.school_id = sc.id
       WHERE sa.student_user_id = $1
       ORDER BY sa.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching applications:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get applications for a scholarship (leaders/admins)
router.get('/scholarships/:id/applications', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;

    const result = await pool.query(
      `SELECT sa.*, u.first_name, u.last_name, u.email,
              r.first_name as reviewer_first_name, r.last_name as reviewer_last_name
       FROM scholarship_applications sa
       LEFT JOIN users u ON sa.student_user_id = u.id
       LEFT JOIN users r ON sa.reviewer_id = r.id
       WHERE sa.scholarship_id = $1
       ORDER BY sa.created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching applications:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Review scholarship application (leaders/admins)
router.put('/scholarship-applications/:id/review', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { status, review_score, reviewer_comments } = req.body;

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (approved, rejected, pending)' });
    }

    const result = await pool.query(
      `UPDATE scholarship_applications 
       SET status = $1,
           review_score = $2,
           reviewer_comments = $3,
           reviewer_id = $4,
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [status, review_score, reviewer_comments, req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Send notification to student
    try {
      const studentId = result.rows[0].student_user_id;
      const statusMessage = status === 'approved' ? 'Your scholarship application has been approved! Congratulations!' : status === 'rejected' ? 'Your scholarship application status has been updated.' : 'Your scholarship application is under review.';
      
      await createNotification(
        studentId,
        'Scholarship Application Update',
        statusMessage,
        status === 'approved' ? 'success' : 'info',
        '/student'
      );
    } catch (notifErr) {
      console.error('Failed to send notification:', notifErr.message);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error reviewing application:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
