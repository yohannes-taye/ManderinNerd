const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user data from database
    const user = await pool.query(
      'SELECT id, email, is_activated FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user.rows[0];
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Activation check middleware
const requireActivation = (req, res, next) => {
  if (!req.user.is_activated) {
    return res.status(403).json({ 
      error: 'Account not activated',
      message: 'Please activate your account before accessing this resource'
    });
  }
  next();
};

// Combined middleware for protected routes
const requireAuthAndActivation = [authenticateToken, requireActivation];

module.exports = {
  authenticateToken,
  requireActivation,
  requireAuthAndActivation
};
