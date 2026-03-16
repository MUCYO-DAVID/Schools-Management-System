const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const role = req.query.role;
    const params = [];
    let query = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.created_at,
             ti.school_name, ti.subject
      FROM users u
      LEFT JOIN teacher_info ti ON u.id = ti.user_id
    `;
    if (role) {
      query += ' WHERE u.role = $1';
      params.push(role);
    }
    query += ' ORDER BY u.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { first_name, last_name, email, role, password, school_name, subject } = req.body;
    if (!first_name || !last_name || !email || !role) {
      return res.status(400).json({ message: 'first_name, last_name, email, and role are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const tempPassword = password || 'ChangeMe123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, email, role`,
      [first_name, last_name, email, hashedPassword, role]
    );

    const userId = result.rows[0].id;

    // If teacher, save additional teacher information
    if (role === 'teacher') {
      await pool.query(
        'INSERT INTO teacher_info (user_id, school_name, subject) VALUES ($1, $2, $3)',
        [userId, school_name || null, subject || null]
      );
    }

    res.status(201).json({
      user: result.rows[0],
      temporaryPassword: password ? undefined : tempPassword,
    });
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ========== USER'S OWN PROFILE ROUTES (must come before /:id routes) ==========

// Get own profile
router.get('/users/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, role, phone, avatar_url, bio, location, date_of_birth, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update own profile
router.put('/users/me', authMiddleware, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, bio, location, date_of_birth, avatar_url } = req.body;
    
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ message: 'first_name, last_name, and email are required' });
    }

    // Check if email is already taken by another user
    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [email, req.user.id]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    const result = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, email = $3, phone = $4, bio = $5, 
           location = $6, date_of_birth = $7, avatar_url = COALESCE($8, avatar_url), updated_at = NOW()
       WHERE id = $9
       RETURNING id, first_name, last_name, email, role, phone, avatar_url, bio, location, date_of_birth, created_at, updated_at`,
      [first_name, last_name, email, phone || null, bio || null, location || null, date_of_birth || null, avatar_url || null, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Upload avatar for own profile
router.post('/users/me/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // Delete old avatar if exists
    const userResult = await pool.query('SELECT avatar_url FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows[0]?.avatar_url) {
      const oldAvatarPath = path.join(__dirname, '..', userResult.rows[0].avatar_url);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    await pool.query('UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2', [avatarUrl, req.user.id]);

    res.json({ avatar_url: avatarUrl });
  } catch (err) {
    console.error('Error uploading avatar:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Change password
router.post('/users/change-password', authMiddleware, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Verify current password
    const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(current_password, userResult.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, req.user.id]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user preferences
router.get('/users/preferences', authMiddleware, async (req, res) => {
  try {
    let result = await pool.query('SELECT * FROM user_preferences WHERE user_id = $1', [req.user.id]);
    
    if (result.rows.length === 0) {
      // Create default preferences
      await pool.query(
        'INSERT INTO user_preferences (user_id) VALUES ($1)',
        [req.user.id]
      );
      result = await pool.query('SELECT * FROM user_preferences WHERE user_id = $1', [req.user.id]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching preferences:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update user preferences
router.put('/users/preferences', authMiddleware, async (req, res) => {
  try {
    const { email_notifications, push_notifications, email_grades, email_applications, email_events, language } = req.body;

    // Check if preferences exist
    const existing = await pool.query('SELECT id FROM user_preferences WHERE user_id = $1', [req.user.id]);
    
    if (existing.rows.length === 0) {
      // Create preferences
      await pool.query(
        `INSERT INTO user_preferences (user_id, email_notifications, push_notifications, email_grades, email_applications, email_events, language)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [req.user.id, email_notifications ?? true, push_notifications ?? false, email_grades ?? true, email_applications ?? true, email_events ?? true, language || 'en']
      );
    } else {
      // Update preferences
      await pool.query(
        `UPDATE user_preferences 
         SET email_notifications = $1, push_notifications = $2, email_grades = $3, 
             email_applications = $4, email_events = $5, language = $6, updated_at = NOW()
         WHERE user_id = $7`,
        [email_notifications ?? true, push_notifications ?? false, email_grades ?? true, email_applications ?? true, email_events ?? true, language || 'en', req.user.id]
      );
    }

    const result = await pool.query('SELECT * FROM user_preferences WHERE user_id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating preferences:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ========== ADMIN ROUTES (for managing other users) ==========

router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, role, password, school_name, subject } = req.body;

    if (!first_name || !last_name || !email || !role) {
      return res.status(400).json({ message: 'first_name, last_name, email, and role are required' });
    }

    const existing = await pool.query('SELECT id, role FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const oldRole = existing.rows[0].role;

    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [email, id]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await pool.query(
        `UPDATE users
         SET first_name = $1, last_name = $2, email = $3, role = $4, password = $5, updated_at = NOW()
         WHERE id = $6`,
        [first_name, last_name, email, role, hashedPassword, id]
      );
    } else {
      await pool.query(
        `UPDATE users
         SET first_name = $1, last_name = $2, email = $3, role = $4, updated_at = NOW()
         WHERE id = $5`,
        [first_name, last_name, email, role, id]
      );
    }

    // Handle teacher info
    if (role === 'teacher') {
      const teacherInfoExists = await pool.query('SELECT id FROM teacher_info WHERE user_id = $1', [id]);
      if (teacherInfoExists.rows.length > 0) {
        await pool.query(
          'UPDATE teacher_info SET school_name = $1, subject = $2, updated_at = NOW() WHERE user_id = $3',
          [school_name || null, subject || null, id]
        );
      } else {
        await pool.query(
          'INSERT INTO teacher_info (user_id, school_name, subject) VALUES ($1, $2, $3)',
          [id, school_name || null, subject || null]
        );
      }
    } else if (oldRole === 'teacher' && role !== 'teacher') {
      // If changing from teacher to another role, delete teacher info
      await pool.query('DELETE FROM teacher_info WHERE user_id = $1', [id]);
    }

    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.created_at,
              ti.school_name, ti.subject
       FROM users u
       LEFT JOIN teacher_info ti ON u.id = ti.user_id
       WHERE u.id = $1`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user by ID (for viewing other profiles)
router.get('/users/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, role, phone, avatar_url, bio, location, date_of_birth, created_at FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Upload avatar (admin can upload for any user)
router.post('/users/:id/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only upload their own avatar, or admins can upload for anyone
    if (Number(id) !== Number(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // Delete old avatar if exists
    const userResult = await pool.query('SELECT avatar_url FROM users WHERE id = $1', [id]);
    if (userResult.rows[0]?.avatar_url) {
      const oldAvatarPath = path.join(__dirname, '..', userResult.rows[0].avatar_url);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    await pool.query('UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2', [avatarUrl, id]);

    res.json({ avatar_url: avatarUrl });
  } catch (err) {
    console.error('Error uploading avatar:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
