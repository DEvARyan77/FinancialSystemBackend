const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  create: async (user) => {
    const { name, email, password, role, status = 'active' } = user;
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, status, created_at`,
      [name, email, password, role, status]
    );
    return result.rows[0];
  },
  findByEmail: async (email) => {
    const result = await pool.query(
      `SELECT id, name, email, password, role, status, created_at
       FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  },
  findById: async (id) => {
    const result = await pool.query(
      `SELECT id, name, email, role, status, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },
  findAll: async () => {
    const result = await pool.query(
      `SELECT id, name, email, role, status, created_at
       FROM users ORDER BY id`
    );
    return result.rows;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
    values.push(id);
    const query = `
      UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
      RETURNING id, name, email, role, status, created_at
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  },
  delete: async (id) => {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }
};

module.exports = User;