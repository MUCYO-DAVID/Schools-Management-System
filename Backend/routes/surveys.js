const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create a new survey response
router.post('/surveys', async (req, res) => {
  const { school_id, rating, would_recommend, comments } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO surveys (school_id, rating, would_recommend, comments)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [school_id || null, rating || null, would_recommend ?? null, comments || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating survey:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;


