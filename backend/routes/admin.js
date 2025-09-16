const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { requireAdmin } = require('../middleware/admin');
require('dotenv').config();

const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER,
  host: "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
});

// Import shared activation codes
const { validActivationCodes } = require('../shared/activationCodes');

// Generate activation code
const generateActivationCode = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Generate activation code endpoint
router.get('/generate-code', requireAdmin, (req, res) => {
  const activationCode = generateActivationCode();
  validActivationCodes.add(activationCode);
  
  res.json({ 
    activationCode,
    message: 'Activation code generated successfully' 
  });
});

// List all activation codes
router.get('/activation-codes', requireAdmin, (req, res) => {
  const codes = Array.from(validActivationCodes);
  res.json({ codes });
});

// Delete activation code
router.delete('/activation-codes/:code', requireAdmin, (req, res) => {
  const { code } = req.params;
  if (validActivationCodes.has(code)) {
    validActivationCodes.delete(code);
    res.json({ message: 'Activation code deleted successfully' });
  } else {
    res.status(404).json({ error: 'Activation code not found' });
  }
});

// Get all users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, email, is_activated, is_admin, created_at, last_login, login_attempts, locked_until
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user status
router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_activated, is_admin } = req.body;
    
    // Build dynamic query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (is_activated !== undefined) {
      updates.push(`is_activated = $${paramCount}`);
      values.push(is_activated);
      paramCount++;
    }
    
    if (is_admin !== undefined) {
      updates.push(`is_admin = $${paramCount}`);
      values.push(is_admin);
      paramCount++;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    // Add the user ID as the last parameter
    values.push(id);
    
    const { rows } = await pool.query(`
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING id, email, is_activated, is_admin
    `, values);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const { rows } = await pool.query(`
      DELETE FROM users 
      WHERE id = $1 
      RETURNING id
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new admin user
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { email, password, is_admin = false } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const { rows } = await pool.query(`
      INSERT INTO users (email, password_hash, is_activated, is_admin, created_by, activation_code)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, is_activated, is_admin, created_at
    `, [email, hashedPassword, true, is_admin, req.user.id, 'ADMIN_CREATED']);
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all blogs
router.get('/blogs', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, title, text, tokens, created_at
      FROM blogs 
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete blog
router.delete('/blogs/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows } = await pool.query(`
      DELETE FROM blogs 
      WHERE id = $1 
      RETURNING id
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get admin dashboard stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [usersResult, blogsResult, activationCodesResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM blogs'),
      pool.query('SELECT COUNT(*) as count FROM users WHERE is_admin = true')
    ]);
    
    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalBlogs: parseInt(blogsResult.rows[0].count),
      totalAdmins: parseInt(activationCodesResult.rows[0].count),
      activeActivationCodes: validActivationCodes.size
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
