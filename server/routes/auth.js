const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { signToken, verifyToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const id = 'usr-' + crypto.randomBytes(6).toString('hex');
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (id, email, name, password_hash, role, registered_at)
       VALUES (?, ?, ?, ?, 'USER', NOW())`,
      [id, email.toLowerCase(), name, passwordHash]
    );

    const user = { id, email: email.toLowerCase(), name, role: 'USER' };
    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid email or password' });

    const dbUser = rows[0];
    if (dbUser.is_banned) return res.status(403).json({ error: 'This account has been suspended' });

    const ok = await bcrypt.compare(password, dbUser.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [dbUser.id]);

    const user = { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role, avatar: dbUser.avatar };
    res.json({ user, token: signToken(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  const [rows] = await pool.query('SELECT id, email, name, role, avatar FROM users WHERE id = ?', [req.user.id]);
  if (!rows.length) return res.status(404).json({ error: 'User not found' });
  res.json(rows[0]);
});

module.exports = router;
