const mysql = require('mysql2/promise');
require('dotenv').config();

// Connection pool — reused across all requests instead of opening
// a new MySQL connection every time (this is what makes it fast
// and safe under concurrent traffic).
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'atelier_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ MySQL connected:', `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    return true;
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   → Check that XAMPP/MySQL is running and server/.env has correct DB_* values.');
    console.error('   → Have you run: npm run seed  (inside /server) to create + seed the database?');
    return false;
  }
}

module.exports = { pool, testConnection };
