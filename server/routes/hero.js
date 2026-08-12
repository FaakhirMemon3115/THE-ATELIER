const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const [[row]] = await pool.query('SELECT * FROM hero_banner WHERE id = 1');
  if (!row) return res.json(null);
  res.json({ title: row.title, subtitle: row.subtitle, tagline: row.tagline, imageUrl: row.image_url });
});

router.put('/', verifyToken, requireAdmin, async (req, res) => {
  const { title, subtitle, tagline, imageUrl } = req.body;
  await pool.query(
    `INSERT INTO hero_banner (id, title, subtitle, tagline, image_url) VALUES (1, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE title=?, subtitle=?, tagline=?, image_url=?`,
    [title, subtitle, tagline, imageUrl, title, subtitle, tagline, imageUrl]
  );
  res.json({ title, subtitle, tagline, imageUrl });
});

module.exports = router;
