const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/galleries';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Get all galleries (public or filtered by school)
router.get('/galleries', async (req, res) => {
  try {
    const { school_id, gallery_type, is_featured } = req.query;

    let query = `
      SELECT g.*, s.name as school_name, u.first_name as creator_first_name, u.last_name as creator_last_name,
             (SELECT COUNT(*) FROM gallery_items WHERE gallery_id = g.id) as item_count
      FROM galleries g
      LEFT JOIN schools s ON g.school_id = s.id
      LEFT JOIN users u ON g.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (school_id) {
      paramCount++;
      query += ` AND g.school_id = $${paramCount}`;
      params.push(school_id);
    }
    if (gallery_type) {
      paramCount++;
      query += ` AND g.gallery_type = $${paramCount}`;
      params.push(gallery_type);
    }
    if (is_featured !== undefined) {
      paramCount++;
      query += ` AND g.is_featured = $${paramCount}`;
      params.push(is_featured === 'true');
    }

    query += ' ORDER BY g.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching galleries:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get single gallery with items
router.get('/galleries/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const galleryResult = await pool.query(
      `SELECT g.*, s.name as school_name, u.first_name as creator_first_name, u.last_name as creator_last_name
       FROM galleries g
       LEFT JOIN schools s ON g.school_id = s.id
       LEFT JOIN users u ON g.created_by = u.id
       WHERE g.id = $1`,
      [id]
    );

    if (galleryResult.rows.length === 0) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    const itemsResult = await pool.query(
      'SELECT * FROM gallery_items WHERE gallery_id = $1 ORDER BY order_index ASC, created_at ASC',
      [id]
    );

    const gallery = galleryResult.rows[0];
    gallery.items = itemsResult.rows;

    res.json(gallery);
  } catch (err) {
    console.error('Error fetching gallery:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create gallery (leaders and admins)
router.post('/galleries', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Only leaders and admins can create galleries' });
    }

    const { school_id, title, description, gallery_type, is_featured } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const result = await pool.query(
      `INSERT INTO galleries (school_id, title, description, gallery_type, is_featured, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [school_id, title, description, gallery_type || 'photos', is_featured || false, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating gallery:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update gallery
router.put('/galleries/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { title, description, gallery_type, is_featured } = req.body;

    // Check if user created this gallery (unless admin)
    if (req.user.role !== 'admin') {
      const check = await pool.query('SELECT * FROM galleries WHERE id = $1 AND created_by = $2', [id, req.user.id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Gallery not found or access denied' });
      }
    }

    const result = await pool.query(
      `UPDATE galleries 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           gallery_type = COALESCE($3, gallery_type),
           is_featured = COALESCE($4, is_featured),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [title, description, gallery_type, is_featured, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating gallery:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete gallery
router.delete('/galleries/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;

    if (req.user.role !== 'admin') {
      const check = await pool.query('SELECT * FROM galleries WHERE id = $1 AND created_by = $2', [id, req.user.id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Gallery not found or access denied' });
      }
    }

    // Delete associated items first (cascade should handle this, but just in case)
    await pool.query('DELETE FROM gallery_items WHERE gallery_id = $1', [id]);
    await pool.query('DELETE FROM galleries WHERE id = $1', [id]);

    res.json({ message: 'Gallery deleted successfully' });
  } catch (err) {
    console.error('Error deleting gallery:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Upload media to gallery
router.post('/galleries/:id/items', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { title, description, order_index } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Determine media type
    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'photo';
    const mediaUrl = `/uploads/galleries/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO gallery_items (gallery_id, media_type, media_url, title, description, order_index)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, mediaType, mediaUrl, title || null, description || null, order_index || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error uploading media:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update gallery item
router.put('/gallery-items/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { title, description, order_index } = req.body;

    const result = await pool.query(
      `UPDATE gallery_items 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           order_index = COALESCE($3, order_index)
       WHERE id = $4
       RETURNING *`,
      [title, description, order_index, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating gallery item:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete gallery item
router.delete('/gallery-items/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;

    // Get the item to delete associated file
    const item = await pool.query('SELECT * FROM gallery_items WHERE id = $1', [id]);
    if (item.rows.length > 0 && item.rows[0].media_url) {
      const filePath = path.join(__dirname, '..', item.rows[0].media_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query('DELETE FROM gallery_items WHERE id = $1', [id]);
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (err) {
    console.error('Error deleting gallery item:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
