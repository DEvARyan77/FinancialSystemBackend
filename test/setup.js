const bcrypt = require('bcryptjs');
const User = require('../models/User');
const FinancialRecord = require('../models/FinancialRecord');
const pool = require('../config/db'); // Will use TEST_DATABASE_URL because NODE_ENV=test

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
  await pool.query(queries);
};

const seedData = async () => {
  // Clear tables
  await pool.query('DELETE FROM financial_records');
  await pool.query('DELETE FROM users');

  // Create users
  const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: await bcrypt.hash('test123', 10), role: 'admin', status: 'active' });
  const analyst = await User.create({ name: 'Analyst', email: 'analyst@test.com', password: await bcrypt.hash('test123', 10), role: 'analyst', status: 'active' });
  const viewer = await User.create({ name: 'Viewer', email: 'viewer@test.com', password: await bcrypt.hash('test123', 10), role: 'viewer', status: 'active' });

  // Create records for analyst
  await FinancialRecord.create({ amount: 1000, type: 'income', category: 'salary', date: '2026-04-01', description: 'Analyst income', user_id: analyst.id });
  await FinancialRecord.create({ amount: 500, type: 'expense', category: 'rent', date: '2026-04-01', description: 'Analyst expense', user_id: analyst.id });
  await FinancialRecord.create({ amount: 200, type: 'expense', category: 'groceries', date: '2026-04-02', description: 'Analyst groceries', user_id: analyst.id });
  await FinancialRecord.create({ amount: 3000, type: 'income', category: 'bonus', date: '2026-03-15', description: 'Analyst bonus', user_id: analyst.id });

  return { admin, analyst, viewer };
};

const cleanup = async () => {
  await pool.end();
};

module.exports = { createTables, seedData, cleanup };