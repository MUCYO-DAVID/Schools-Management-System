const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Get or create direct chat room between two users
router.post('/chat/rooms/direct', authMiddleware, async (req, res) => {
  try {
    const { other_user_id } = req.body;

    if (!other_user_id) {
      return res.status(400).json({ message: 'Other user ID is required' });
    }

    // Check if room already exists
    const existingRoom = await pool.query(
      `SELECT cr.* FROM chat_rooms cr
       INNER JOIN chat_room_members crm1 ON cr.id = crm1.room_id
       INNER JOIN chat_room_members crm2 ON cr.id = crm2.room_id
       WHERE cr.room_type = 'direct'
       AND crm1.user_id = $1 AND crm2.user_id = $2`,
      [req.user.id, other_user_id]
    );

    if (existingRoom.rows.length > 0) {
      return res.json(existingRoom.rows[0]);
    }

    // Create new room
    const roomResult = await pool.query(
      `INSERT INTO chat_rooms (room_type, created_by) VALUES ('direct', $1) RETURNING *`,
      [req.user.id]
    );

    const roomId = roomResult.rows[0].id;

    // Add both users to room
    await pool.query(
      `INSERT INTO chat_room_members (room_id, user_id) VALUES ($1, $2), ($1, $3)`,
      [roomId, req.user.id, other_user_id]
    );

    res.status(201).json(roomResult.rows[0]);
  } catch (err) {
    console.error('Error creating chat room:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get or create group chat room for a school
router.post('/chat/rooms/group', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Only leaders and admins can create group chats' });
    }

    const { school_id, name } = req.body;

    if (!school_id || !name) {
      return res.status(400).json({ message: 'School ID and name are required' });
    }

    const result = await pool.query(
      `INSERT INTO chat_rooms (room_type, school_id, name, created_by) VALUES ('group', $1, $2, $3) RETURNING *`,
      [school_id, name, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating group chat:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user's chat rooms
router.get('/chat/rooms', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT cr.*, s.name as school_name,
              (SELECT COUNT(*) FROM chat_messages WHERE room_id = cr.id AND created_at > crm.last_read_at) as unread_count,
              (SELECT message FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message_time
       FROM chat_rooms cr
       INNER JOIN chat_room_members crm ON cr.id = crm.room_id
       LEFT JOIN schools s ON cr.school_id = s.id
       WHERE crm.user_id = $1
       ORDER BY last_message_time DESC NULLS LAST`,
      [req.user.id]
    );

    // For direct chats, get the other user's info
    for (let room of result.rows) {
      if (room.room_type === 'direct') {
        const otherUser = await pool.query(
          `SELECT u.id, u.first_name, u.last_name, u.role
           FROM users u
           INNER JOIN chat_room_members crm ON u.id = crm.user_id
           WHERE crm.room_id = $1 AND u.id != $2`,
          [room.id, req.user.id]
        );
        if (otherUser.rows.length > 0) {
          room.other_user = otherUser.rows[0];
          room.name = `${otherUser.rows[0].first_name} ${otherUser.rows[0].last_name}`;
        }
      }
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching chat rooms:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get messages for a chat room
router.get('/chat/rooms/:roomId/messages', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify user is member of this room
    const memberCheck = await pool.query(
      'SELECT * FROM chat_room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT cm.*, u.first_name as sender_first_name, u.last_name as sender_last_name, u.role as sender_role
       FROM chat_messages cm
       LEFT JOIN users u ON cm.sender_id = u.id
       WHERE cm.room_id = $1
       ORDER BY cm.created_at DESC
       LIMIT $2 OFFSET $3`,
      [roomId, limit, offset]
    );

    // Update last_read_at for this user
    await pool.query(
      'UPDATE chat_room_members SET last_read_at = NOW() WHERE room_id = $1 AND user_id = $2',
      [roomId, req.user.id]
    );

    res.json(result.rows.reverse());
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Send message
router.post('/chat/rooms/:roomId/messages', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message, message_type, attachment_url } = req.body;

    if (!message && !attachment_url) {
      return res.status(400).json({ message: 'Message or attachment is required' });
    }

    // Verify user is member of this room
    const memberCheck = await pool.query(
      'SELECT * FROM chat_room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `INSERT INTO chat_messages (room_id, sender_id, message, message_type, attachment_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [roomId, req.user.id, message || '', message_type || 'text', attachment_url || null]
    );

    // Get sender info
    const messageWithSender = await pool.query(
      `SELECT cm.*, u.first_name as sender_first_name, u.last_name as sender_last_name, u.role as sender_role
       FROM chat_messages cm
       LEFT JOIN users u ON cm.sender_id = u.id
       WHERE cm.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(messageWithSender.rows[0]);
  } catch (err) {
    console.error('Error sending message:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add member to group chat (leaders/admins only)
router.post('/chat/rooms/:roomId/members', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Only leaders and admins can add members' });
    }

    const { roomId } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const result = await pool.query(
      `INSERT INTO chat_room_members (room_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (room_id, user_id) DO NOTHING
       RETURNING *`,
      [roomId, user_id]
    );

    res.status(201).json(result.rows[0] || { message: 'User already in room' });
  } catch (err) {
    console.error('Error adding member:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get members of a chat room
router.get('/chat/rooms/:roomId/members', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;

    // Verify user is member of this room
    const memberCheck = await pool.query(
      'SELECT * FROM chat_room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT crm.*, u.first_name, u.last_name, u.email, u.role
       FROM chat_room_members crm
       LEFT JOIN users u ON crm.user_id = u.id
       WHERE crm.room_id = $1`,
      [roomId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching members:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get unread message count
router.get('/chat/unread-count', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as unread_count
       FROM chat_messages cm
       INNER JOIN chat_room_members crm ON cm.room_id = crm.room_id
       WHERE crm.user_id = $1 AND cm.sender_id != $1 AND cm.created_at > crm.last_read_at`,
      [req.user.id]
    );

    res.json({ unread_count: parseInt(result.rows[0].unread_count) || 0 });
  } catch (err) {
    console.error('Error fetching unread count:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
