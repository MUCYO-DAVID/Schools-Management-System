const express = require('express');
const router = express.Router();
const pool = require('../db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authMiddleware } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'portal');
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
  limits: { fileSize: 10 * 1024 * 1024 },
});

const isStaffRole = (role) => ['admin', 'leader', 'teacher'].includes(role);

router.get('/portal/announcements', authMiddleware, async (req, res) => {
  try {
    const role = req.user.role;
    let query = 'SELECT * FROM announcements';
    const params = [];

    if (role !== 'admin' && role !== 'leader') {
      query += ' WHERE audience_role IN ($1, $2)';
      params.push('all', role);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching announcements:', err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/portal/announcements', authMiddleware, async (req, res) => {
  try {
    if (!isStaffRole(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, body, audience_role = 'all' } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: 'title and body are required' });
    }

    const result = await pool.query(
      `INSERT INTO announcements (title, body, audience_role, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, body, audience_role, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating announcement:', err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/portal/messages/inbox', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.first_name AS sender_first_name, u.last_name AS sender_last_name, u.email AS sender_email
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.recipient_id = $1
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching inbox messages:', err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/portal/messages/sent', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.first_name AS recipient_first_name, u.last_name AS recipient_last_name, u.email AS recipient_email
       FROM messages m
       LEFT JOIN users u ON m.recipient_id = u.id
       WHERE m.sender_id = $1
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching sent messages:', err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/portal/messages', authMiddleware, async (req, res) => {
  try {
    const { recipient_id, subject, body } = req.body;
    if (!recipient_id || !body) {
      return res.status(400).json({ message: 'recipient_id and body are required' });
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, recipient_id, subject, body)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, recipient_id, subject || null, body]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error sending message:', err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/portal/messages/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE messages SET read_at = NOW()
       WHERE id = $1 AND recipient_id = $2
       RETURNING *`,
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error marking message as read:', err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/portal/documents', authMiddleware, async (req, res) => {
  try {
    const role = req.user.role;
    let query = 'SELECT * FROM portal_documents';
    const params = [];
    if (role !== 'admin' && role !== 'leader') {
      query += ' WHERE audience_role IN ($1, $2)';
      params.push('all', role);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching documents:', err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/portal/documents', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!isStaffRole(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, audience_role = 'all' } = req.body;
    if (!title || !req.file) {
      return res.status(400).json({ message: 'title and file are required' });
    }

    const fileUrl = `/uploads/portal/${req.file.filename}`;
    const result = await pool.query(
      `INSERT INTO portal_documents (title, file_url, audience_role, uploaded_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, fileUrl, audience_role, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error uploading document:', err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/portal/recipients', authMiddleware, async (req, res) => {
  try {
    const role = req.query.role;
    const params = [];
    let query = 'SELECT id, first_name, last_name, email, role FROM users';

    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }

    if (params.length > 0) {
      query += ' AND id != $2';
      params.push(req.user.id);
    } else {
      query += ' WHERE id != $1';
      params.push(req.user.id);
    }

    query += ' ORDER BY first_name ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching recipients:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
