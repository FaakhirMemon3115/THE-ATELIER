/**
 * THE ATELIER — Database Seeder
 * ---------------------------------------------------------
 * Creates the schema (if not present) and populates MySQL with:
 *   - 54 real dummy products (same catalog used in the frontend)
 *   - 1 default admin user
 *   - 3 sample coupons
 *   - hero banner defaults
 *
 * Run with:  npm run seed   (from inside /server, after `npm install`)
 * Safe to re-run — it TRUNCATEs and re-inserts every time.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const PRODUCTS = require('./products-seed-data.json');

async function main() {
  console.log('🔧 Connecting to MySQL server...');

  // First connect WITHOUT a database selected, so we can create it if missing.
  const rootConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  console.log('📐 Creating database + tables from schema.sql ...');
  await rootConn.query(schemaSql);
  await rootConn.end();

  // Now connect to the actual database for seeding.
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'atelier_db',
    multipleStatements: true
  });

  console.log('🧹 Clearing old data...');
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  await conn.query('TRUNCATE TABLE payment_transactions');
  await conn.query('TRUNCATE TABLE order_items');
  await conn.query('TRUNCATE TABLE orders');
  await conn.query('TRUNCATE TABLE coupons');
  await conn.query('TRUNCATE TABLE products');
  await conn.query('TRUNCATE TABLE users');
  await conn.query('TRUNCATE TABLE hero_banner');
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  // ── Seed Products ──────────────────────────────────────
  console.log(`📦 Inserting ${PRODUCTS.length} dummy products...`);
  const productInsertSql = `
    INSERT INTO products
      (id, sku, name, category, subcategory, price, original_price, discount_percentage,
       badge, rating, reviews_count, primary_image, secondary_image, description,
       material, care, fit, sizes, colors, stock, mood, is_day, is_night, featured)
    VALUES ?
  `;
  const productRows = PRODUCTS.map((p) => [
    p.id,
    p.sku,
    p.name,
    p.category,
    p.subcategory || null,
    p.price,
    p.originalPrice ?? null,
    p.discountPercentage ?? null,
    p.badge ?? null,
    p.rating ?? 0,
    p.reviewsCount ?? 0,
    p.primaryImage || null,
    p.secondaryImage || null,
    p.description || null,
    p.material || null,
    p.care || null,
    p.fit || null,
    JSON.stringify(p.sizes || []),
    JSON.stringify(p.colors || []),
    p.stock ?? 0,
    p.mood ?? null,
    p.isDay ? 1 : 0,
    p.isNight ? 1 : 0,
    p.featured ? 1 : 0
  ]);
  await conn.query(productInsertSql, [productRows]);

  // ── Seed Admin User ────────────────────────────────────
  console.log('👤 Creating default admin user...');
  const adminPasswordHash = await bcrypt.hash('atif@access.com', 10);
  await conn.query(
    `INSERT INTO users (id, email, name, password_hash, role, avatar, registered_at)
     VALUES (?, ?, ?, ?, 'ADMIN', ?, NOW())`,
    ['usr-admin', 'atif@admin.com', 'Atelier Administrator', adminPasswordHash, '/images/hero_model.png']
  );

  // ── Seed Coupons ───────────────────────────────────────
  console.log('🎟️  Creating sample coupons...');
  await conn.query(
    `INSERT INTO coupons (code, discount_percent, is_used) VALUES ?`,
    [[
      ['ATELIER10', 10, 0],
      ['LUXE20', 20, 0],
      ['SPRING500', 15, 0]
    ]]
  );

  // ── Seed Hero Banner ───────────────────────────────────
  console.log('🖼️  Setting default hero banner...');
  await conn.query(
    `INSERT INTO hero_banner (id, title, subtitle, tagline, image_url) VALUES (1, ?, ?, ?, ?)`,
    ['THE NEW ERA SS26', 'HAUTE COUTURE COLLECTION', 'Sculpted silhouettes, liquid silk gowns, and artisan leather craft.', '/images/hero_model.png']
  );

  await conn.end();

  console.log('');
  console.log('✅ Database seeded successfully!');
  console.log(`   • ${PRODUCTS.length} products`);
  console.log('   • 1 admin user (atif@admin.com / atif@access.com)');
  console.log('   • 3 coupons (ATELIER10, LUXE20, SPRING500)');
  console.log('   • hero banner defaults');
  console.log('');
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
