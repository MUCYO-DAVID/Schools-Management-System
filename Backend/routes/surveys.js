const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// Helper function to optionally get user from token
const getOptionalUser = (req) => {
  try {
    let token = req.header('x-auth-token');
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.user;
    }
  } catch (err) {
    // Token invalid or missing - that's okay for this endpoint
  }
  return null;
};

// Get all surveys with likes count, replies count, and user's like status
router.get('/surveys', async (req, res) => {
  try {
    const user = getOptionalUser(req);
    const userId = user?.id ? parseInt(user.id) : null;

    // Build query based on whether user is authenticated
    let query;
    let params;

    if (userId) {
      // Authenticated user - check if they liked each survey
      query = `
        SELECT 
          s.id,
          s.school_id,
          s.rating,
          s.would_recommend,
          s.comments,
          s.created_at,
          sch.name as school_name,
          sch.location as school_location,
          COALESCE(COUNT(DISTINCT sl.id), 0)::INTEGER as likes_count,
          COALESCE(COUNT(DISTINCT sr.id), 0)::INTEGER as replies_count,
          EXISTS(SELECT 1 FROM survey_likes WHERE survey_id = s.id AND user_id = $1) as is_liked
        FROM surveys s
        LEFT JOIN schools sch ON s.school_id = sch.id
        LEFT JOIN survey_likes sl ON s.id = sl.survey_id
        LEFT JOIN survey_replies sr ON s.id = sr.survey_id
        WHERE s.comments IS NOT NULL AND s.comments != ''
        GROUP BY s.id, sch.name, sch.location
        ORDER BY likes_count DESC, s.created_at DESC
      `;
      params = [userId];
    } else {
      // Not authenticated - is_liked is always false
      query = `
        SELECT 
          s.id,
          s.school_id,
          s.rating,
          s.would_recommend,
          s.comments,
          s.created_at,
          sch.name as school_name,
          sch.location as school_location,
          COALESCE(COUNT(DISTINCT sl.id), 0)::INTEGER as likes_count,
          COALESCE(COUNT(DISTINCT sr.id), 0)::INTEGER as replies_count,
          false as is_liked
        FROM surveys s
        LEFT JOIN schools sch ON s.school_id = sch.id
        LEFT JOIN survey_likes sl ON s.id = sl.survey_id
        LEFT JOIN survey_replies sr ON s.id = sr.survey_id
        WHERE s.comments IS NOT NULL AND s.comments != ''
        GROUP BY s.id, sch.name, sch.location
        ORDER BY likes_count DESC, s.created_at DESC
      `;
      params = [];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching surveys:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get replies for a specific survey
router.get('/surveys/:id/replies', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        sr.id,
        sr.survey_id,
        sr.reply_text,
        sr.created_at,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email
      FROM survey_replies sr
      JOIN users u ON sr.user_id = u.id
      WHERE sr.survey_id = $1
      ORDER BY sr.created_at ASC
    `, [id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching replies:', err.message);
    res.status(500).send('Server Error');
  }
});

// Create a new survey response
router.post('/surveys', async (req, res) => {
  const { school_id, rating, would_recommend, comments } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO surveys (school_id, rating, would_recommend, comments)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [school_id || null, rating || null, would_recommend ?? null, comments || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating survey:', err.message);
    res.status(500).send('Server Error');
  }
});

// Like or unlike a survey comment
router.post('/surveys/:id/like', authMiddleware.authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if like already exists
    const existingLike = await pool.query(
      'SELECT * FROM survey_likes WHERE survey_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingLike.rows.length > 0) {
      // Unlike - remove the like
      await pool.query(
        'DELETE FROM survey_likes WHERE survey_id = $1 AND user_id = $2',
        [id, userId]
      );

      // Get updated likes count
      const countResult = await pool.query(
        'SELECT COUNT(*) as count FROM survey_likes WHERE survey_id = $1',
        [id]
      );

      res.json({
        liked: false,
        likes_count: parseInt(countResult.rows[0].count)
      });
    } else {
      // Like - add the like
      await pool.query(
        'INSERT INTO survey_likes (survey_id, user_id) VALUES ($1, $2)',
        [id, userId]
      );

      // Get updated likes count
      const countResult = await pool.query(
        'SELECT COUNT(*) as count FROM survey_likes WHERE survey_id = $1',
        [id]
      );

      res.json({
        liked: true,
        likes_count: parseInt(countResult.rows[0].count)
      });
    }
  } catch (err) {
    console.error('Error toggling like:', err.message);
    res.status(500).send('Server Error');
  }
});

// Add a reply to a survey comment
router.post('/surveys/:id/replies', authMiddleware.authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { reply_text } = req.body;
  const userId = req.user.id;

  if (!reply_text || reply_text.trim() === '') {
    return res.status(400).json({ message: 'Reply text is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO survey_replies (survey_id, user_id, reply_text)
       VALUES ($1, $2, $3)
       RETURNING id, survey_id, reply_text, created_at`,
      [id, userId, reply_text.trim()]
    );

    // Get user info for the reply
    const userResult = await pool.query(
      'SELECT id, first_name, last_name, email FROM users WHERE id = $1',
      [userId]
    );

    res.status(201).json({
      ...result.rows[0],
      user_id: userResult.rows[0].id,
      first_name: userResult.rows[0].first_name,
      last_name: userResult.rows[0].last_name,
      email: userResult.rows[0].email
    });
  } catch (err) {
    console.error('Error adding reply:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;


