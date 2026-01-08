const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationCode } = require('../utils/emailService');

// Helper function to generate a 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check if JWT_SECRET is defined
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined. Please set it in your .env file.');
  process.exit(1);
}

// User login - generates verification code for regular users, returns token directly for admins
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

    const userData = user.rows[0];
    const isAdmin = userData.role === 'admin';

    // If admin, skip 2FA and return token directly
    if (isAdmin) {
      const payload = {
        user: {
          id: userData.id,
          role: userData.role,
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

          const { id, first_name, last_name, email, role } = userData;
          console.log('Admin login successful - token generated directly');
          res.json({
            token,
            user: { id, first_name, last_name, email, role },
            requiresVerification: false
          });
        }
      );
      return; // Exit early for admin
    }

    // For non-admin users, proceed with 2FA verification
    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Delete any existing codes for this email
    try {
      await pool.query('DELETE FROM verification_codes WHERE email = $1', [email]);
    } catch (deleteError) {
      console.error('Error deleting existing codes:', deleteError.message);
      // Continue anyway - might be first code for this email
    }

    // Store the verification code
    try {
      await pool.query(
        'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
        [email, code, expiresAt]
      );
    } catch (insertError) {
      console.error('Error inserting verification code:', insertError.message);
      throw new Error(`Failed to store verification code: ${insertError.message}`);
    }

    // Send verification code via email
    try {
      await sendVerificationCode(email, code);
      console.log(`Verification code sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError.message);
      // Still return success to user, but log the error
      // In production, you might want to handle this differently
    }

    res.json({
      message: 'Verification code sent to your email',
      requiresVerification: true
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    console.error('Full error:', err);
    res.status(500).json({
      message: 'Server Error during login',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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

// Verify code endpoint
router.post('/auth/verify-code', async (req, res) => {
  const { email, code } = req.body;

  try {
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    // Find the verification code
    const result = await pool.query(
      'SELECT * FROM verification_codes WHERE email = $1 AND code = $2 ORDER BY created_at DESC LIMIT 1',
      [email, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    const verificationCode = result.rows[0];

    // Check if code has expired
    if (new Date(verificationCode.expires_at) < new Date()) {
      await pool.query('DELETE FROM verification_codes WHERE email = $1', [email]);
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    // Get user information
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Delete the used verification code
    await pool.query('DELETE FROM verification_codes WHERE email = $1', [email]);

    // Generate JWT token
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

        const { id, first_name, last_name, email, role } = user.rows[0];
        res.json({
          token,
          user: { id, first_name, last_name, email, role },
        });
      }
    );
  } catch (err) {
    console.error('Verify Code Error:', err.message);
    res.status(500).json({ message: 'Server Error during verification' });
  }
});

// Resend code endpoint
router.post('/auth/resend-code', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Generate new verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Delete any existing codes for this email
    await pool.query('DELETE FROM verification_codes WHERE email = $1', [email]);

    // Store the new verification code
    await pool.query(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt]
    );

    // Send verification code via email
    try {
      await sendVerificationCode(email, code);
      console.log(`New verification code sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError.message);
      // Still return success to user, but log the error
    }

    res.json({
      message: 'Verification code sent to your email'
    });
  } catch (err) {
    console.error('Resend Code Error:', err.message);
    res.status(500).json({ message: 'Server Error during resend' });
  }
});

module.exports = router;