const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// Get school details by school ID
router.get('/schools/:schoolId/details', async (req, res) => {
  try {
    const { schoolId } = req.params;

    const result = await pool.query(
      'SELECT * FROM school_details WHERE school_id = $1',
      [schoolId]
    );

    if (result.rows.length === 0) {
      return res.json(null); // Return null if no details exist
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching school details:', err.message);
    res.status(500).send('Server Error');
  }
});

// Create or update school details (admin/headmaster only)
router.post('/schools/:schoolId/details', authMiddleware.authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { schoolId } = req.params;
    const {
      description,
      facilities,
      programs,
      admission_requirements,
      fees_info,
      contact_email,
      contact_phone,
      website,
      address,
      working_hours,
      principal_name
    } = req.body;

    // Check if school exists
    const schoolCheck = await pool.query('SELECT * FROM schools WHERE id = $1', [schoolId]);
    if (schoolCheck.rows.length === 0) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Check if details already exist
    const existing = await pool.query(
      'SELECT * FROM school_details WHERE school_id = $1',
      [schoolId]
    );

    if (existing.rows.length > 0) {
      // Update existing
      const result = await pool.query(`
        UPDATE school_details
        SET description = $1,
            facilities = $2,
            programs = $3,
            admission_requirements = $4,
            fees_info = $5,
            contact_email = $6,
            contact_phone = $7,
            website = $8,
            address = $9,
            working_hours = $10,
            principal_name = $11,
            updated_at = CURRENT_TIMESTAMP
        WHERE school_id = $12
        RETURNING *
      `, [
        description || null,
        facilities || null,
        programs || null,
        admission_requirements || null,
        fees_info || null,
        contact_email || null,
        contact_phone || null,
        website || null,
        address || null,
        working_hours || null,
        principal_name || null,
        schoolId
      ]);

      res.json(result.rows[0]);
    } else {
      // Create new
      const result = await pool.query(`
        INSERT INTO school_details (
          school_id, description, facilities, programs, admission_requirements,
          fees_info, contact_email, contact_phone, website, address,
          working_hours, principal_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        schoolId,
        description || null,
        facilities || null,
        programs || null,
        admission_requirements || null,
        fees_info || null,
        contact_email || null,
        contact_phone || null,
        website || null,
        address || null,
        working_hours || null,
        principal_name || null
      ]);

      res.status(201).json(result.rows[0]);
    }
  } catch (err) {
    console.error('Error saving school details:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
