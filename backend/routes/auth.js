const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
require('dotenv').config();

const router = express.Router();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
});

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// JWT secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate activation code
const generateActivationCode = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Store valid activation codes (in production, use a database table)
const validActivationCodes = new Set();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('activationCode').notEmpty().withMessage('Activation code is required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Register endpoint
router.post('/register', authLimiter, registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, activationCode } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Check if activation code is valid and hasn't been used
    if (!validActivationCodes.has(activationCode)) {
      return res.status(400).json({ error: 'Invalid activation code' });
    }

    const codeCheck = await pool.query(
      'SELECT id FROM users WHERE activation_code = $1 AND is_activated = false',
      [activationCode]
    );

    if (codeCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Activation code has already been used' });
    }

    // Remove the activation code from valid codes since it's being used
    validActivationCodes.delete(activationCode);
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, activation_code, is_activated) VALUES ($1, $2, $3, false) RETURNING id, email, is_activated',
      [email, hashedPassword, activationCode]
    );

    res.status(201).json({
      message: 'User registered successfully. Please activate your account.',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        is_activated: result.rows[0].is_activated
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Activate account endpoint
router.post('/activate', authLimiter, async (req, res) => {
  try {
    const { email, activationCode } = req.body;

    if (!email || !activationCode) {
      return res.status(400).json({ error: 'Email and activation code are required' });
    }

    // Find user with matching email and activation code
    const user = await pool.query(
      'SELECT id, email, activation_code, is_activated FROM users WHERE email = $1 AND activation_code = $2',
      [email, activationCode]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or activation code' });
    }

    if (user.rows[0].is_activated) {
      return res.status(400).json({ error: 'Account is already activated' });
    }

    // Activate the account
    await pool.query(
      'UPDATE users SET is_activated = true, activation_code_used_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.rows[0].id]
    );

    res.json({ message: 'Account activated successfully' });

  } catch (error) {
    console.error('Activation error:', error);
    res.status(500).json({ error: 'Server error during activation' });
  }
});

// Login endpoint
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await pool.query(
      'SELECT id, email, password_hash, is_activated, login_attempts, locked_until FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userData = user.rows[0];

    // Check if account is locked
    if (userData.locked_until && new Date() < new Date(userData.locked_until)) {
      return res.status(423).json({ error: 'Account is temporarily locked due to too many failed attempts' });
    }

    // Check if account is activated
    if (!userData.is_activated) {
      return res.status(403).json({ error: 'Account not activated. Please activate your account first.' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, userData.password_hash);

    if (!isValidPassword) {
      // Increment login attempts
      const newAttempts = userData.login_attempts + 1;
      const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // Lock for 15 minutes

      await pool.query(
        'UPDATE users SET login_attempts = $1, locked_until = $2 WHERE id = $3',
        [newAttempts, lockUntil, userData.id]
      );

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    await pool.query(
      'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [userData.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: userData.id, email: userData.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userData.id,
        email: userData.email,
        is_activated: userData.is_activated
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user data
    const user = await pool.query(
      'SELECT id, email, is_activated FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      valid: true,
      user: user.rows[0]
    });

  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Generate activation code endpoint
router.get('/generate-code', (req, res) => {
  const activationCode = generateActivationCode();
  validActivationCodes.add(activationCode);
  
  res.json({ 
    activationCode,
    message: 'Activation code generated successfully. Use this code to register.' 
  });
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
