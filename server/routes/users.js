const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/users — admin only
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, email, name, role, avatar, is_banned, registered_at, last_login_at FROM users ORDER BY registered_at DESC'
  );
  res.json(rows);
});

// PATCH /api/users/:id/ban — admin only
router.patch('/:id/ban', verifyToken, requireAdmin, async (req, res) => {
  const { isBanned } = req.body;
  await pool.query('UPDATE users SET is_banned = ? WHERE id = ?', [isBanned ? 1 : 0, req.params.id]);
  res.json({ success: true });
});

// DELETE /api/users/:id — admin only
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// PUT /api/users/profile — update profile (authenticated user)
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    
    await pool.query(
      'UPDATE users SET name = ?, avatar = ? WHERE id = ?',
      [name, avatar || null, req.user.id]
    );
    
    const [rows] = await pool.query('SELECT id, email, name, role, avatar FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/users/change-password — change password (authenticated user)
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }
    
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    
    const dbUser = rows[0];
    const ok = await bcrypt.compare(oldPassword, dbUser.password_hash);
    if (!ok) return res.status(401).json({ error: 'Incorrect current password' });
    
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
