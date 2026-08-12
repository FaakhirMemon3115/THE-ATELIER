require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');

const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/orders');
const couponsRouter = require('./routes/coupons');
const paymentsRouter = require('./routes/payments');
const heroRouter = require('./routes/hero');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // JazzCash/EasyPaisa callbacks arrive as form-urlencoded POST

app.get('/api/health', async (req, res) => {
  res.json({ status: 'ok', service: 'the-atelier-api', time: new Date().toISOString() });
});

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/hero', heroRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Central error handler — guarantees the API never crashes silently
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

(async () => {
  const connected = await testConnection();
  if (!connected) {
    console.warn('⚠️  Starting server anyway, but API calls will fail until MySQL is reachable.');
    console.warn('   Run: cd server && npm run seed   (after configuring server/.env)');
  }
  app.listen(PORT, () => {
    console.log(`🚀 The Atelier API running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });
})();
