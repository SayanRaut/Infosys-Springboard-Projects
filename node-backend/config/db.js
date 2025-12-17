const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 1. Force a test query to verify connection immediately
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database Connection Error:', err);
  } else {
    console.log('✅ Connected to PostgreSQL Database');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};