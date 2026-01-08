const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

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

// Create a new application
router.post('/applications', authMiddleware.authMiddleware, async (req, res) => {
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

    // Verify school exists
    const schoolCheck = await pool.query('SELECT * FROM schools WHERE id = $1', [school_id]);
    if (schoolCheck.rows.length === 0) {
      return res.status(404).json({ message: 'School not found' });
    }

    const result = await pool.query(`
      INSERT INTO student_applications (
        user_id, school_id, first_name, last_name, email, phone,
        date_of_birth, current_grade, desired_grade, previous_school,
        parent_name, parent_email, parent_phone, address, additional_info
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      userId, school_id, first_name, last_name, email, phone,
      date_of_birth || null, current_grade || null, desired_grade || null, previous_school || null,
      parent_name || null, parent_email || null, parent_phone || null, address || null, additional_info || null
    ]);

    // Get school info for response
    const schoolInfo = schoolCheck.rows[0];
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

module.exports = router;
