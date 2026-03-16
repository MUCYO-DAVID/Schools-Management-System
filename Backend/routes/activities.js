const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/activities/recent', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const activities = [];

    const schools = await pool.query(
      'SELECT id, name, created_at FROM schools ORDER BY created_at DESC LIMIT 5'
    );
    schools.rows.forEach((row) => {
      activities.push({
        id: `school-${row.id}`,
        action: 'New school registered',
        school: row.name,
        created_at: row.created_at,
      });
    });

    const applications = await pool.query(
      `SELECT sa.id, sa.created_at, s.name
       FROM student_applications sa
       JOIN schools s ON sa.school_id = s.id
       ORDER BY sa.created_at DESC
       LIMIT 5`
    );
    applications.rows.forEach((row) => {
      activities.push({
        id: `application-${row.id}`,
        action: 'New student application',
        school: row.name,
        created_at: row.created_at,
      });
    });

    const surveys = await pool.query(
      `SELECT s.id, s.created_at, sch.name
       FROM surveys s
       LEFT JOIN schools sch ON s.school_id = sch.id
       ORDER BY s.created_at DESC
       LIMIT 5`
    );
    surveys.rows.forEach((row) => {
      activities.push({
        id: `survey-${row.id}`,
        action: 'New school feedback',
        school: row.name || 'General feedback',
        created_at: row.created_at,
      });
    });

    const contacts = await pool.query(
      'SELECT id, name, created_at FROM contacts ORDER BY created_at DESC LIMIT 5'
    );
    contacts.rows.forEach((row) => {
      activities.push({
        id: `contact-${row.id}`,
        action: 'New contact message',
        school: row.name,
        created_at: row.created_at,
      });
    });

    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(activities.slice(0, 10));
  } catch (err) {
    console.error('Error fetching recent activities:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
