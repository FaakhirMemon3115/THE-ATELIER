const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../config/db');
const jazzcash = require('../services/jazzcash');
const easypaisa = require('../services/easypaisa');

// ── JAZZCASH ────────────────────────────────────────────────

// POST /api/payments/jazzcash/initiate  { orderId, mobileNumber }
// Returns { gatewayUrl, params } — the frontend auto-submits these
// as a hidden HTML form via POST to gatewayUrl (JazzCash's required flow).
router.post('/jazzcash/initiate', async (req, res) => {
  try {
    const { orderId, mobileNumber } = req.body;
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const txnRefNo = 'T' + Date.now();
    const { gatewayUrl, params } = jazzcash.buildPaymentRequest({
      txnRefNo,
      amountInRupees: Number(order.total),
      billReference: order.id,
      description: `The Atelier Order ${order.id}`,
      customerMobile: mobileNumber
    });

    await pool.query(
      `INSERT INTO payment_transactions (order_id, provider, txn_ref_number, amount, status)
       VALUES (?, 'JazzCash', ?, ?, 'Initiated')`,
      [order.id, txnRefNo, order.total]
    );

    res.json({ gatewayUrl, params });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to initiate JazzCash payment' });
  }
});

// POST /api/payments/jazzcash/callback — JazzCash redirects the
// customer's browser here (as a POST) after they complete/cancel payment.
router.post('/jazzcash/callback', async (req, res) => {
  try {
    const result = jazzcash.verifyCallback(req.body);
    const txnRefNo = req.body.pp_TxnRefNo;
    const billReference = req.body.pp_BillReference; // this is our order id

    await pool.query(
      `UPDATE payment_transactions
       SET status = ?, response_code = ?, response_message = ?, raw_response = ?
       WHERE txn_ref_number = ?`,
      [
        result.isValid && result.isSuccess ? 'Success' : 'Failed',
        result.responseCode || null,
        result.responseMessage || null,
        JSON.stringify(req.body),
        txnRefNo
      ]
    );

    if (result.isValid && result.isSuccess && billReference) {
      await pool.query(`UPDATE orders SET payment_status = 'Paid', status = 'Processing' WHERE id = ?`, [billReference]);
    } else if (billReference) {
      await pool.query(`UPDATE orders SET payment_status = 'Failed' WHERE id = ?`, [billReference]);
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const status = result.isValid && result.isSuccess ? 'success' : 'failed';
    res.redirect(`${clientUrl}/?payment=${status}&order=${billReference}&provider=jazzcash`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Payment callback processing failed');
  }
});

// ── EASYPAISA ───────────────────────────────────────────────

router.post('/easypaisa/initiate', async (req, res) => {
  try {
    const { orderId } = req.body;
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const orderRefNum = 'EP' + Date.now();
    const { gatewayUrl, params } = easypaisa.buildPaymentRequest({
      orderRefNum,
      amountInRupees: Number(order.total),
      description: `The Atelier Order ${order.id}`
    });

    await pool.query(
      `INSERT INTO payment_transactions (order_id, provider, txn_ref_number, amount, status)
       VALUES (?, 'EasyPaisa', ?, ?, 'Initiated')`,
      [order.id, orderRefNum, order.total]
    );

    res.json({ gatewayUrl, params });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to initiate EasyPaisa payment' });
  }
});

router.post('/easypaisa/callback', async (req, res) => {
  try {
    const result = easypaisa.verifyCallback(req.body, process.env.EASYPAISA_HASH_KEY);
    const orderRefNum = req.body.orderRefNumber || req.body.orderRefNum;

    const [[txn]] = await pool.query('SELECT * FROM payment_transactions WHERE txn_ref_number = ?', [orderRefNum]);

    await pool.query(
      `UPDATE payment_transactions SET status = ?, response_code = ?, raw_response = ? WHERE txn_ref_number = ?`,
      [result.isSuccess ? 'Success' : 'Failed', result.status || null, JSON.stringify(req.body), orderRefNum]
    );

    if (txn) {
      if (result.isSuccess) {
        await pool.query(`UPDATE orders SET payment_status = 'Paid', status = 'Processing' WHERE id = ?`, [txn.order_id]);
      } else {
        await pool.query(`UPDATE orders SET payment_status = 'Failed' WHERE id = ?`, [txn.order_id]);
      }
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/?payment=${result.isSuccess ? 'success' : 'failed'}&order=${txn?.order_id || ''}&provider=easypaisa`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Payment callback processing failed');
  }
});

// GET /api/payments/status/:orderId — frontend polls this after redirect
router.get('/status/:orderId', async (req, res) => {
  const [[order]] = await pool.query('SELECT id, payment_status, status FROM orders WHERE id = ?', [req.params.orderId]);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ paymentStatus: order.payment_status, orderStatus: order.status });
});

module.exports = router;
