const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const { createNotification } = require('./notifications');

// Get all events (filtered by school, role, date range)
router.get('/events', authMiddleware, async (req, res) => {
  try {
    const { school_id, start_date, end_date, event_type } = req.query;

    let query = `
      SELECT e.*, s.name as school_name, u.first_name as creator_first_name, u.last_name as creator_last_name,
             (SELECT COUNT(*) FROM event_rsvps WHERE event_id = e.id AND status = 'attending') as attending_count
      FROM events e
      LEFT JOIN schools s ON e.school_id = s.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE (e.audience_role = 'all' OR e.audience_role = $1)
    `;
    const params = [req.user.role];
    let paramCount = 1;

    if (school_id) {
      paramCount++;
      query += ` AND e.school_id = $${paramCount}`;
      params.push(school_id);
    }
    if (start_date) {
      paramCount++;
      query += ` AND e.start_date >= $${paramCount}`;
      params.push(start_date);
    }
    if (end_date) {
      paramCount++;
      query += ` AND e.start_date <= $${paramCount}`;
      params.push(end_date);
    }
    if (event_type) {
      paramCount++;
      query += ` AND e.event_type = $${paramCount}`;
      params.push(event_type);
    }

    query += ' ORDER BY e.start_date ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching events:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get single event
router.get('/events/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT e.*, s.name as school_name, u.first_name as creator_first_name, u.last_name as creator_last_name,
              (SELECT COUNT(*) FROM event_rsvps WHERE event_id = e.id AND status = 'attending') as attending_count
       FROM events e
       LEFT JOIN schools s ON e.school_id = s.id
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching event:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create event (leaders, teachers, admins)
router.post('/events', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only leaders, teachers, and admins can create events' });
    }

    const {
      school_id,
      title,
      description,
      event_type,
      start_date,
      end_date,
      location,
      audience_role,
      reminder_enabled,
      reminder_minutes
    } = req.body;

    if (!title || !start_date) {
      return res.status(400).json({ message: 'Title and start date are required' });
    }

    const result = await pool.query(
      `INSERT INTO events (school_id, title, description, event_type, start_date, end_date, location, audience_role, created_by, reminder_enabled, reminder_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [school_id, title, description, event_type || 'general', start_date, end_date, location, audience_role || 'all', req.user.id, reminder_enabled || false, reminder_minutes || 60]
    );

    // Send notification to relevant users
    try {
      const audienceQuery = audience_role === 'all' 
        ? 'SELECT id FROM users WHERE id != $1' 
        : 'SELECT id FROM users WHERE role = $2 AND id != $1';
      
      const audienceParams = audience_role === 'all' ? [req.user.id] : [req.user.id, audience_role];
      const users = await pool.query(audienceQuery, audienceParams);

      for (const user of users.rows) {
        await createNotification(
          user.id,
          `New Event: ${title}`,
          `${description || 'A new event has been scheduled'} - ${new Date(start_date).toLocaleDateString()}`,
          'info',
          '/events'
        );
      }
    } catch (notifErr) {
      console.error('Failed to send notifications:', notifErr.message);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating event:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update event
router.put('/events/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const {
      title,
      description,
      event_type,
      start_date,
      end_date,
      location,
      audience_role,
      reminder_enabled,
      reminder_minutes
    } = req.body;

    // Check if user created this event (unless admin)
    if (req.user.role !== 'admin') {
      const check = await pool.query('SELECT * FROM events WHERE id = $1 AND created_by = $2', [id, req.user.id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Event not found or access denied' });
      }
    }

    const result = await pool.query(
      `UPDATE events 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           event_type = COALESCE($3, event_type),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date),
           location = COALESCE($6, location),
           audience_role = COALESCE($7, audience_role),
           reminder_enabled = COALESCE($8, reminder_enabled),
           reminder_minutes = COALESCE($9, reminder_minutes),
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [title, description, event_type, start_date, end_date, location, audience_role, reminder_enabled, reminder_minutes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating event:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete event
router.delete('/events/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Only leaders and admins can delete events' });
    }

    const { id } = req.params;

    if (req.user.role !== 'admin') {
      const check = await pool.query('SELECT * FROM events WHERE id = $1 AND created_by = $2', [id, req.user.id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Event not found or access denied' });
      }
    }

    await pool.query('DELETE FROM events WHERE id = $1', [id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// RSVP to event
router.post('/events/:id/rsvp', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'attending', 'not_attending', 'maybe'

    const result = await pool.query(
      `INSERT INTO event_rsvps (event_id, user_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (event_id, user_id)
       DO UPDATE SET status = $3
       RETURNING *`,
      [id, req.user.id, status || 'attending']
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error RSVPing to event:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user's RSVP status for an event
router.get('/events/:id/rsvp/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM event_rsvps WHERE event_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ rsvp_status: null });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching RSVP status:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get attendees for an event
router.get('/events/:id/attendees', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT er.*, u.first_name, u.last_name, u.email, u.role
       FROM event_rsvps er
       LEFT JOIN users u ON er.user_id = u.id
       WHERE er.event_id = $1
       ORDER BY er.created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching attendees:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
