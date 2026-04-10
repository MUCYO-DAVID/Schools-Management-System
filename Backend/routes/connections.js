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
 * @route   GET /api/connections/suggested
 * @desc    Get suggested users to add as friends
 */
router.get('/connections/suggested', authMiddleware, async (req, res) => {
  try {
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
       WHERE id != $1
       ORDER BY RANDOM()
       LIMIT 50`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching suggested users:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route   GET /api/connections/all-users
 * @desc    Get all users in the system for the People tab
 */
router.get('/connections/all-users', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, role, avatar_url FROM users`
    );
    
    // Manual filtering for safety
    const currentUserId = parseInt(req.user.id);
    const otherUsers = result.rows.filter(u => parseInt(u.id) !== currentUserId);

    // Fetch connections in a separate query to be extremely safe
    const connResult = await pool.query(
      `SELECT * FROM user_connections WHERE sender_id = $1 OR receiver_id = $1`,
      [currentUserId]
    );

    const finalUsers = otherUsers.map(u => {
      const targetId = parseInt(u.id);
      const conn = connResult.rows.find(c => 
        (parseInt(c.sender_id) === currentUserId && parseInt(c.receiver_id) === targetId) || 
        (parseInt(c.receiver_id) === currentUserId && parseInt(c.sender_id) === targetId)
      );
      return {
        ...u,
        connection_status: conn ? conn.status : null,
        request_sender_id: conn ? parseInt(conn.sender_id) : null
      };
    });

    res.json(finalUsers);
  } catch (err) {
    console.error('Error fetching all users:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route   POST /api/connections/request
 * @desc    Send a friend request or cancel an existing one
 */
router.post('/connections/request', authMiddleware, async (req, res) => {
  try {
    const receiver_id = parseInt(req.body.receiver_id);
    const sender_id = parseInt(req.user.id);

    console.log(`Connection request from ${sender_id} to ${receiver_id}`);

    if (isNaN(receiver_id) || isNaN(sender_id) || receiver_id === sender_id) {
      console.log('Invalid receiver ID or self-request:', { receiver_id, sender_id });
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

    const sender_id = connRequest.rows[0].sender_id;
    const receiver_id = req.user.id;

    // Automatically create a direct chat room
    try {
      // Check if room already exists
      const existingRoom = await pool.query(
        `SELECT cr.id FROM chat_rooms cr
         INNER JOIN chat_room_members crm1 ON cr.id = crm1.room_id
         INNER JOIN chat_room_members crm2 ON cr.id = crm2.room_id
         WHERE cr.room_type = 'direct'
         AND crm1.user_id = $1 AND crm2.user_id = $2`,
        [sender_id, receiver_id]
      );

      if (existingRoom.rows.length === 0) {
        // Create new room
        const roomResult = await pool.query(
          `INSERT INTO chat_rooms (room_type, created_by) VALUES ('direct', $1) RETURNING id`,
          [receiver_id]
        );
        const roomId = roomResult.rows[0].id;

        // Add both users to room
        await pool.query(
          `INSERT INTO chat_room_members (room_id, user_id) VALUES ($1, $2), ($1, $3)`,
          [roomId, sender_id, receiver_id]
        );
      }
    } catch (roomErr) {
      console.error('Error auto-creating chat room:', roomErr.message);
      // Don't fail the whole request if room creation fails
    }

    // Notify the sender
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
      [
        sender_id,
        'Friend Request Accepted',
        `${req.user.first_name} accepted your friend request. You can now chat!`,
        'connection',
        '/inbox'
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

/**
 * @route   DELETE /api/connections/:userId
 * @desc    Remove a connection (unfollow)
 */
router.delete('/connections/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const result = await pool.query(
      'DELETE FROM user_connections WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) RETURNING *',
      [currentUserId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    res.json({ message: 'Connection removed successfully' });
  } catch (err) {
    console.error('Error removing connection:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
