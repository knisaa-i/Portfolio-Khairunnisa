// config/database.js
// Konfigurasi koneksi MySQL menggunakan connection pool

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'portfolio_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0,
  // Charset agar mendukung karakter unicode (emoji, dll)
  charset: 'utf8mb4',
  timezone: '+07:00', // WIB
});

// Test koneksi saat pertama kali dipanggil
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL terhubung — host:', process.env.DB_HOST, '| db:', process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error('❌ Koneksi MySQL gagal:', err.message);
    console.error('   Pastikan MySQL berjalan dan .env sudah dikonfigurasi.');
    process.exit(1);
  }
}

testConnection();

module.exports = pool;
