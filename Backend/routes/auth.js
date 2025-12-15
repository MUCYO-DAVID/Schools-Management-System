const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Check if JWT_SECRET is defined
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined. Please set it in your .env file.');
  process.exit(1); 
}

// User login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Check password (use password column from schema)
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Generate JWT
    const payload = {
      user: {
        id: user.rows[0].id,
        role: user.rows[0].role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error('JWT Sign Error:', err.message);
          return res.status(500).json({ message: 'Token generation failed' });
        }
        console.log('Token generated successfully.'); // Log successful token generation

        // Return both token and basic user info so the frontend can
        // correctly set role-based redirects and context.
        const { id, first_name, last_name, email, role } = user.rows[0];
        res.json({
          token,
          user: { id, first_name, last_name, email, role },
        });
      }
    );
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Server Error during login' }); // Ensure JSON response
  }
});

// User registration
router.post('/auth/signup', async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to database (use password column from schema)
    const newUser = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, role',
      [first_name, last_name, email, hashedPassword, role || 'student'] // Default role to student if not provided
    );

    // Generate JWT
    const payload = {
      user: {
        id: newUser.rows[0].id,
        role: newUser.rows[0].role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error('JWT Sign Error:', err.message);
          return res.status(500).json({ message: 'Token generation failed' });
        }
        console.log('Token generated successfully for new user.');

        // Return both token and created user info
        const createdUser = newUser.rows[0];
        res.status(201).json({
          token,
          user: createdUser,
        });
      }
    );
  } catch (err) {
    console.error('Signup Error:', err.message);
    res.status(500).json({ message: 'Server Error during signup' });
  }
});

module.exports = router;