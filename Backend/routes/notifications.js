const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get all notifications for the logged-in user
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT id, title, message, type, read, link, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notifications:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get unread notification count
router.get('/notifications/unread-count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
      [userId]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error('Error fetching unread count:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      `UPDATE notifications
       SET read = true
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking notification as read:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Mark all notifications as read
router.put('/notifications/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await pool.query(
      'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
      [userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking all as read:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a notification
router.delete('/notifications/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting notification:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a notification (internal use - called by other routes)
async function createNotification(userId, title, message, type = 'info', link = null) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, title, message, type, link]
    );
    console.log(`✅ Notification created for user ${userId}: ${title}`);
  } catch (err) {
    console.error('Error creating notification:', err.message);
  }
}

module.exports = router;
module.exports.createNotification = createNotification;
