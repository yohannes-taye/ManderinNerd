const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
});

const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user data and check if admin
    const user = await pool.query(
      'SELECT id, email, is_admin FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!user.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user.rows[0];
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { requireAdmin };
