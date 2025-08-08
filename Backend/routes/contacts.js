const express = require('express');
const router = express.Router();
const pool = require('../db');



router.post('/contacts', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // NEW: verify what the frontend actually sends
    console.log('Received body', req.body);

    try {
        const newContact = await pool.query(
            'INSERT INTO contacts (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, subject, message]
        );
        res.status(201).json(newContact.rows[0]);
    } catch (err) {
        console.error('Error inserting contact:', err.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;