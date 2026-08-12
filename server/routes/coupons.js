const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
  res.json(rows.map((c) => ({
    code: c.code,
    discountPercent: c.discount_percent,
    isUsed: !!c.is_used,
    usedByEmail: c.used_by_email || undefined
  })));
});

// POST /api/coupons/validate — check a coupon is usable
router.post('/validate', async (req, res) => {
  const { code } = req.body;
  const [rows] = await pool.query('SELECT * FROM coupons WHERE code = ?', [(code || '').toUpperCase()]);
  if (!rows.length) return res.status(404).json({ error: 'Invalid coupon code' });
  if (rows[0].is_used) return res.status(400).json({ error: 'This coupon has already been used' });
  res.json({ code: rows[0].code, discountPercent: rows[0].discount_percent });
});

router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const { code, discountPercent } = req.body;
  await pool.query(
    'INSERT INTO coupons (code, discount_percent, is_used) VALUES (?, ?, 0)',
    [String(code).toUpperCase(), Number(discountPercent)]
  );
  res.status(201).json({ code: String(code).toUpperCase(), discountPercent: Number(discountPercent), isUsed: false });
});

router.delete('/:code', verifyToken, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM coupons WHERE code = ?', [req.params.code]);
  res.json({ success: true });
});

module.exports = router;
