const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/schools', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schools');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching schools:', err.message);
        res.status(500).send('Server Error');
  }
});
router.post('/schools', async (req, res) => {
    const { id, name, name_rw, location, type, level, students, established } = req.body;
    try {
        const newSchool = await pool.query(
            'INSERT INTO schools(id,name,name_rw,location,type,level,students,established) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
            [id, name, name_rw, location, type, level, students, established]
        );
        res.status(201).json(newSchool.rows[0]);
    } catch (error) {
        console.error('Error inserting school:', err.message);
        res.status(500).send('Server Error');
    }
});
router.delete('/schools/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM schools WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('School not found');
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting school:', err.message);
        res.status(500).send('Server Error');
    }
});
router.put('/schools/:id', async (req, res) => {
    const { id } = req.params;
    const { name, name_rw, location, type, level, students, established } = req.body;
    try {
        const result = await pool.query(
            'UPDATE schools SET name = $1, name_rw = $2, location = $3, type = $4, level = $5, students = $6, established = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
            [name, name_rw, location, type, level, students, established, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('School not found');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating school:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
