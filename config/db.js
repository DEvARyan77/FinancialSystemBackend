const { Pool } = require('pg');
require('dotenv').config();

let connectionString;

// Use test database if running tests, otherwise use the main DATABASE_URL
if (process.env.NODE_ENV === 'test') {
  connectionString = process.env.TEST_DATABASE_URL;
} else {
  connectionString = process.env.DATABASE_URL;
}

const pool = new Pool({
  connectionString,
});

// Create tables automatically only for non‑test environment
if (process.env.NODE_ENV !== 'test') {
  const createTables = async () => {
    const queries = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('viewer', 'analyst', 'admin')),
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS financial_records (
        id SERIAL PRIMARY KEY,
        amount REAL NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        category TEXT NOT NULL,
        date DATE NOT NULL,
        description TEXT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NULL
      );
    `;
    try {
      await pool.query(queries);
      console.log('Database tables created/verified.');
    } catch (err) {
      console.error('Error creating tables:', err.message);
      process.exit(1);
    }
  };
  createTables().catch(console.error);
}

module.exports = pool;