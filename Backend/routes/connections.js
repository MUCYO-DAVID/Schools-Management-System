const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/users/search
 * @desc    Search for users to add as friends
 */
router.get('/users/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.json([]);
    }

    const result = await pool.query(
      `SELECT id, first_name, last_name, email, role, avatar_url,
              (SELECT status FROM user_connections 
               WHERE (sender_id = $1 AND receiver_id = u.id) 
                  OR (sender_id = u.id AND receiver_id = $1)
               LIMIT 1) as connection_status,
              (SELECT sender_id FROM user_connections 
               WHERE (sender_id = $1 AND receiver_id = u.id) 
                  OR (sender_id = u.id AND receiver_id = $1)
               LIMIT 1) as request_sender_id
       FROM users u 
       WHERE (first_name ILIKE $2 OR last_name ILIKE $2 OR email ILIKE $2)
       AND id != $1
       LIMIT 20`,
      [req.user.id, `%${query}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error searching users:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route   POST /api/connections/request
 * @desc    Send a friend request or cancel an existing one
 */
router.post('/connections/request', authMiddleware, async (req, res) => {
  try {
    const { receiver_id } = req.body;
    const sender_id = req.user.id;

    if (!receiver_id || receiver_id === sender_id) {
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }

    // Check if connection already exists
    const existing = await pool.query(
      'SELECT * FROM user_connections WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)',
      [sender_id, receiver_id]
    );

    if (existing.rows.length > 0) {
      const conn = existing.rows[0];
      if (conn.status === 'pending' && conn.sender_id === sender_id) {
        // Cancel request
        await pool.query('DELETE FROM user_connections WHERE id = $1', [conn.id]);
        return res.json({ message: 'Request cancelled', status: null });
      } else if (conn.status === 'accepted') {
        return res.status(400).json({ message: 'Already connected' });
      } else {
        return res.status(400).json({ message: 'Connection already exists' });
      }
    }

    // Create new request
    const result = await pool.query(
      'INSERT INTO user_connections (sender_id, receiver_id, status) VALUES ($1, $2, $3) RETURNING *',
      [sender_id, receiver_id, 'pending']
    );

    // Create a notification for the receiver
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
      [
        receiver_id,
        'New Friend Request',
        `${req.user.first_name || 'Someone'} sent you a friend request.`,
        'connection',
        '/profile?tab=connections'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error sending request:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route   POST /api/connections/respond
 * @desc    Accept or reject a friend request
 */
router.post('/connections/respond', authMiddleware, async (req, res) => {
  try {
    const { request_id, action } = req.body; // action: 'accepted' or 'rejected'
    
    if (!['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const connRequest = await pool.query(
      'SELECT * FROM user_connections WHERE id = $1 AND receiver_id = $2 AND status = $3',
      [request_id, req.user.id, 'pending']
    );

    if (connRequest.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (action === 'rejected') {
      await pool.query('DELETE FROM user_connections WHERE id = $1', [request_id]);
      return res.json({ message: 'Request rejected' });
    }

    // Accept request
    const result = await pool.query(
      'UPDATE user_connections SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['accepted', request_id]
    );

    // Notify the sender
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
      [
        connRequest.rows[0].sender_id,
        'Friend Request Accepted',
        `${req.user.first_name} accepted your friend request. You can now chat!`,
        'connection',
        '/chat'
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error responding to request:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route   GET /api/connections/friends
 * @desc    Get list of accepted friends
 */
router.get('/connections/friends', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.avatar_url
       FROM users u
       INNER JOIN user_connections uc ON (u.id = uc.sender_id OR u.id = uc.receiver_id)
       WHERE (uc.sender_id = $1 OR uc.receiver_id = $1)
       AND u.id != $1
       AND uc.status = 'accepted'`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching friends:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route   GET /api/connections/pending
 * @desc    Get list of pending friend requests received
 */
router.get('/connections/pending', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT uc.id as request_id, u.id as user_id, u.first_name, u.last_name, u.email, u.role, u.avatar_url, uc.created_at
       FROM users u
       INNER JOIN user_connections uc ON u.id = uc.sender_id
       WHERE uc.receiver_id = $1 AND uc.status = 'pending'`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching pending requests:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
