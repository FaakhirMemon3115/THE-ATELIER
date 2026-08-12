const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

function genOrderId() {
  return 'ATL-' + Date.now().toString().slice(-8) + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();
}
function genTrackingNumber() {
  return 'TRK' + crypto.randomBytes(5).toString('hex').toUpperCase();
}

async function rowsToOrder(orderRow, itemRows) {
  return {
    id: orderRow.id,
    date: orderRow.date,
    customerName: orderRow.customer_name,
    customerEmail: orderRow.customer_email,
    customerPhone: orderRow.customer_phone,
    shippingAddress: `${orderRow.shipping_address}, ${orderRow.city}${orderRow.postal_code ? ' ' + orderRow.postal_code : ''}`,
    subtotal: Number(orderRow.subtotal),
    discount: Number(orderRow.discount),
    shipping: Number(orderRow.shipping_fee),
    total: Number(orderRow.total),
    status: orderRow.status,
    paymentMethod: orderRow.payment_method,
    paymentStatus: orderRow.payment_status,
    trackingNumber: orderRow.tracking_number,
    items: itemRows.map((i) => ({
      productId: i.product_id,
      productName: i.product_name,
      price: Number(i.price),
      quantity: i.quantity,
      selectedSize: i.selected_size,
      selectedColor: i.selected_color,
      image: i.image
    }))
  };
}

// GET /api/orders — admin: all orders. logged-in user: only their own.
router.get('/', verifyToken, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const [orderRows] = isAdmin
      ? await pool.query('SELECT * FROM orders ORDER BY date DESC')
      : await pool.query('SELECT * FROM orders WHERE customer_email = ? ORDER BY date DESC', [req.user.email]);

    const results = [];
    for (const o of orderRows) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
      results.push(await rowsToOrder(o, items));
    }
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders — create a new order (stock is decremented atomically)
router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      customerName, customerEmail, customerPhone, address, city, postalCode,
      items, couponCode, paymentMethod, userId
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !address || !city || !items?.length) {
      return res.status(400).json({ error: 'Missing required checkout fields' });
    }

    await conn.beginTransaction();

    // Re-price server-side from the DB (never trust client-sent prices)
    let subtotal = 0;
    const resolvedItems = [];
    for (const it of items) {
      const [[product]] = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [it.productId]);
      if (!product) throw new Error(`Product ${it.productId} not found`);
      if (product.stock < it.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      subtotal += Number(product.price) * it.quantity;
      resolvedItems.push({
        productId: product.id,
        productName: product.name,
        price: Number(product.price),
        quantity: it.quantity,
        selectedSize: it.selectedSize,
        selectedColor: it.selectedColor,
        image: product.primary_image
      });
    }

    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const [[coupon]] = await conn.query('SELECT * FROM coupons WHERE code = ?', [couponCode.toUpperCase()]);
      if (coupon && !coupon.is_used) {
        discount = Math.round(subtotal * (coupon.discount_percent / 100));
        appliedCoupon = coupon;
      }
    }

    const shipping = subtotal - discount >= 15000 ? 0 : 350;
    const total = subtotal - discount + shipping;

    const orderId = genOrderId();
    const trackingNumber = genTrackingNumber();
    const method = paymentMethod === 'JazzCash' || paymentMethod === 'EasyPaisa' ? paymentMethod : 'Cash on Delivery';
    const paymentStatus = method === 'Cash on Delivery' ? 'Unpaid' : 'Unpaid'; // set to Paid after gateway callback confirms

    await conn.query(
      `INSERT INTO orders
        (id, user_id, customer_name, customer_email, customer_phone, shipping_address, city, postal_code,
         subtotal, discount, shipping_fee, total, coupon_code, status, payment_method, payment_status, tracking_number, date)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, NOW())`,
      [
        orderId, userId || null, customerName, customerEmail, customerPhone, address, city, postalCode || null,
        subtotal, discount, shipping, total, appliedCoupon?.code || null, 'Pending', method, paymentStatus, trackingNumber
      ]
    );

    for (const it of resolvedItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, selected_size, selected_color, image)
         VALUES (?,?,?,?,?,?,?,?)`,
        [orderId, it.productId, it.productName, it.price, it.quantity, it.selectedSize, it.selectedColor, it.image]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [it.quantity, it.productId]);
    }

    if (appliedCoupon) {
      await conn.query('UPDATE coupons SET is_used = 1, used_by_email = ? WHERE code = ?', [customerEmail, appliedCoupon.code]);
    }

    await conn.commit();

    const [[orderRow]] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [itemRows] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    res.status(201).json(await rowsToOrder(orderRow, itemRows));
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(400).json({ error: err.message || 'Failed to place order' });
  } finally {
    conn.release();
  }
});

// PATCH /api/orders/:id/status — admin only
router.patch('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
