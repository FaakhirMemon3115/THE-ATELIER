const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

function rowToProduct(row) {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    discountPercentage: row.discount_percentage ?? undefined,
    badge: row.badge ?? undefined,
    rating: Number(row.rating),
    reviewsCount: row.reviews_count,
    primaryImage: row.primary_image,
    secondaryImage: row.secondary_image,
    description: row.description,
    material: row.material,
    care: row.care,
    fit: row.fit,
    sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes,
    colors: typeof row.colors === 'string' ? JSON.parse(row.colors) : row.colors,
    stock: row.stock,
    mood: row.mood,
    isDay: !!row.is_day,
    isNight: !!row.is_night,
    featured: !!row.featured
  };
}

// GET /api/products — list all
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows.map(rowToProduct));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rowToProduct(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products — create (admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const p = req.body;
    const id = p.id || `prod-${Date.now()}`;
    await pool.query(
      `INSERT INTO products
        (id, sku, name, category, subcategory, price, original_price, discount_percentage,
         badge, rating, reviews_count, primary_image, secondary_image, description,
         material, care, fit, sizes, colors, stock, mood, is_day, is_night, featured)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, p.sku, p.name, p.category, p.subcategory, p.price, p.originalPrice ?? null,
        p.discountPercentage ?? null, p.badge ?? null, p.rating ?? 0, p.reviewsCount ?? 0,
        p.primaryImage, p.secondaryImage, p.description, p.material, p.care, p.fit,
        JSON.stringify(p.sizes || []), JSON.stringify(p.colors || []), p.stock ?? 0,
        p.mood ?? null, p.isDay ? 1 : 0, p.isNight ? 1 : 0, p.featured ? 1 : 0
      ]
    );
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.status(201).json(rowToProduct(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id — update (admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const p = req.body;
    await pool.query(
      `UPDATE products SET sku=?, name=?, category=?, subcategory=?, price=?, original_price=?,
        discount_percentage=?, badge=?, rating=?, reviews_count=?, primary_image=?, secondary_image=?,
        description=?, material=?, care=?, fit=?, sizes=?, colors=?, stock=?, mood=?, is_day=?, is_night=?, featured=?
       WHERE id=?`,
      [
        p.sku, p.name, p.category, p.subcategory, p.price, p.originalPrice ?? null,
        p.discountPercentage ?? null, p.badge ?? null, p.rating ?? 0, p.reviewsCount ?? 0,
        p.primaryImage, p.secondaryImage, p.description, p.material, p.care, p.fit,
        JSON.stringify(p.sizes || []), JSON.stringify(p.colors || []), p.stock ?? 0,
        p.mood ?? null, p.isDay ? 1 : 0, p.isNight ? 1 : 0, p.featured ? 1 : 0,
        req.params.id
      ]
    );
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rowToProduct(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id — (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// PATCH /api/products/:id/restock — (admin only)
router.patch('/:id/restock', verifyToken, requireAdmin, async (req, res) => {
  try {
    const qty = Number(req.body.qty) || 0;
    await pool.query('UPDATE products SET stock = stock + ? WHERE id = ?', [qty, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(rowToProduct(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to restock product' });
  }
});

module.exports = router;
