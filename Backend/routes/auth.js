const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ REQUIRED: import sendVerificationCode from your emailService
const { sendVerificationCode } = require('../utils/emailService');
// ⚠️  Adjust path if needed: '../services/emailService' or '../helpers/emailService'

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

// ✅ Generates a 6-digit code e.g. "847291"
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const userData = result.rows[0];

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    if (userData.role === 'admin') {
      const payload = { user: { id: userData.id, role: userData.role } };

      return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
        if (err) {
          console.error('JWT Sign Error:', err.message);
          return res.status(500).json({ message: 'Token generation failed' });
        }

        const { id, first_name, last_name, role } = userData;
        console.log(`✅ Admin login complete — token issued for ${email}`);
        res.json({
          token,
          user: { id, first_name, last_name, email, role },
          requiresVerification: false,
        });
      });
    }

    // Leaders skip the email code — they answer security questions instead
    if (userData.role === 'leader') {
      console.log(`Leader login initiated for ${email}`);
      return res.json({
        requiresVerification: true,
        verificationType: 'leader_questions',
        email,
      });
    }

    // All other roles: generate, store, and EMAIL the 6-digit code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query('DELETE FROM verification_codes WHERE email = $1', [email]);
    await pool.query(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt]
    );

    try {
      await sendVerificationCode(email, code);
      console.log(`✅ Verification code sent to ${email}`);
    } catch (emailError) {
      console.error(' Failed to send verification email:', emailError.message);
      await pool.query('DELETE FROM verification_codes WHERE email = $1', [email]);
      return res.status(500).json({
        message: 'Failed to send verification code. Please try again.',
      });
    }

    // Do NOT return a token here — user must verify the code first
    return res.json({
      requiresVerification: true,
      verificationType: 'code',
      email,
      message: 'A verification code has been sent to your email.',
    });

  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({
      message: 'Server Error during login',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

// ─────────────────────────────────────────────
// POST /auth/signup
// ─────────────────────────────────────────────
router.post('/auth/signup', async (req, res) => {
  const { first_name, last_name, email, password, role, school_name, subject, school_id } = req.body;

  try {
    const validRoles = ['student', 'leader', 'teacher'];
    const userRole =
      role && validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : 'student';

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, role, school_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, email, role, school_id',
      [first_name, last_name, email, hashedPassword, userRole, school_id || null]
    );

    const userId = newUser.rows[0].id;

    if (userRole === 'teacher') {
      await pool.query(
        'INSERT INTO teacher_info (user_id, school_name, subject) VALUES ($1, $2, $3)',
        [userId, school_name || null, subject || null]
      );
    }

    const payload = { user: { id: userId, role: newUser.rows[0].role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err.message);
        return res.status(500).json({ message: 'Token generation failed' });
      }
      res.status(201).json({ token, user: newUser.rows[0] });
    });

  } catch (err) {
    console.error('Signup Error:', err.message);
    res.status(500).json({ message: 'Server Error during signup' });
  }
});

// ─────────────────────────────────────────────
// POST /auth/verify-code
// Token is issued HERE — only after code is confirmed.
// ─────────────────────────────────────────────
router.post('/auth/verify-code', async (req, res) => {
  const { email, code, leaderAnswers } = req.body;

  try {
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const userData = userResult.rows[0];

    // Leader: verify security question answers then issue token
    if (userData.role === 'leader') {
      if (!leaderAnswers) {
        return res.status(400).json({ message: 'Leader verification answers are required' });
      }

      const answer1 = (leaderAnswers.answer1 || '').toLowerCase().trim();
      const answer2 = (leaderAnswers.answer2 || '').toLowerCase().trim();

      const a1Valid =
        answer1.includes('school') ||
        answer1.includes('management') ||
        answer1.includes('lead') ||
        answer1.includes('admin');
      const a2Valid =
        answer2 === 'yes' ||
        answer2 === 'y' ||
        answer2.includes('authorized') ||
        answer2.includes('can');

      if (!a1Valid || !a2Valid) {
        return res.status(400).json({ message: 'Verification failed. Please provide correct answers.' });
      }

      const payload = { user: { id: userData.id, role: userData.role } };
      return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
        if (err) return res.status(500).json({ message: 'Token generation failed' });
        const { id, first_name, last_name, email, role } = userData;
        console.log(`✅ Leader verified: ${email}`);
        res.json({ token, user: { id, first_name, last_name, email, role } });
      });
    }

    // Regular users: validate the emailed code
    if (!code) return res.status(400).json({ message: 'Verification code is required' });

    const codeResult = await pool.query(
      'SELECT * FROM verification_codes WHERE email = $1 AND code = $2 ORDER BY created_at DESC LIMIT 1',
      [email, code]
    );

    if (codeResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    const storedCode = codeResult.rows[0];

    if (new Date(storedCode.expires_at) < new Date()) {
      await pool.query('DELETE FROM verification_codes WHERE email = $1', [email]);
      return res.status(400).json({ message: 'Verification code has expired. Please log in again.' });
    }

    // Code confirmed — delete it to prevent reuse
    await pool.query('DELETE FROM verification_codes WHERE email = $1', [email]);

    // Issue the JWT token now
    const payload = { user: { id: userData.id, role: userData.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err.message);
        return res.status(500).json({ message: 'Token generation failed' });
      }
      const { id, first_name, last_name, email, role } = userData;
      console.log(`✅ Login complete — token issued for ${email}`);
      res.json({ token, user: { id, first_name, last_name, email, role } });
    });

  } catch (err) {
    console.error('Verify Code Error:', err.message);
    res.status(500).json({ message: 'Server Error during verification' });
  }
});

// ─────────────────────────────────────────────
// POST /auth/resend-code
// ─────────────────────────────────────────────
router.post('/auth/resend-code', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query('DELETE FROM verification_codes WHERE email = $1', [email]);
    await pool.query(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt]
    );

    try {
      await sendVerificationCode(email, code);
      console.log(`✅ Resent verification code to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to resend verification email:', emailError.message);
      return res.status(500).json({ message: 'Failed to send verification code. Please try again.' });
    }

    res.json({ message: 'Verification code sent to your email' });

  } catch (err) {
    console.error('Resend Code Error:', err.message);
    res.status(500).json({ message: 'Server Error during resend' });
  }
});

module.exports = router;
