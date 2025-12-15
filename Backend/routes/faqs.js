const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all FAQs (for a future FAQ page/section)
router.get('/faqs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, question, answer, created_at FROM faqs ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching FAQs:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;


