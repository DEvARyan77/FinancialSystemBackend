const pool = require('../config/db');

const FinancialRecord = {
  create: async (record) => {
    const { amount, type, category, date, description, user_id } = record;
    const result = await pool.query(
      `INSERT INTO financial_records (amount, type, category, date, description, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [amount, type, category, date, description, user_id]
    );
    return result.rows[0];
  },
  findById: async (id) => {
    const result = await pool.query(
      `SELECT * FROM financial_records WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rows[0];
  },
  findByUser: async (userId, filters = {}) => {
    let query = `SELECT * FROM financial_records WHERE deleted_at IS NULL`;
    const values = [];
    let idx = 1;

    if (userId !== null) {
      query += ` AND user_id = $${idx}`;
      values.push(userId);
      idx++;
    }

    if (filters.type) {
      query += ` AND type = $${idx}`;
      values.push(filters.type);
      idx++;
    }
    if (filters.category) {
      query += ` AND category = $${idx}`;
      values.push(filters.category);
      idx++;
    }
    if (filters.from) {
      query += ` AND date >= $${idx}`;
      values.push(filters.from);
      idx++;
    }
    if (filters.to) {
      query += ` AND date <= $${idx}`;
      values.push(filters.to);
      idx++;
    }

    query += ` ORDER BY date DESC, created_at DESC LIMIT $${idx} OFFSET $${idx+1}`;
    values.push(parseInt(filters.limit || 100), parseInt(filters.offset || 0));

    const result = await pool.query(query, values);
    return result.rows;
  },
  countByUser: async (userId, filters = {}) => {
    let query = `SELECT COUNT(*) as total FROM financial_records WHERE deleted_at IS NULL`;
    const values = [];
    let idx = 1;

    if (userId !== null) {
      query += ` AND user_id = $${idx}`;
      values.push(userId);
      idx++;
    }

    if (filters.type) {
      query += ` AND type = $${idx}`;
      values.push(filters.type);
      idx++;
    }
    if (filters.category) {
      query += ` AND category = $${idx}`;
      values.push(filters.category);
      idx++;
    }
    if (filters.from) {
      query += ` AND date >= $${idx}`;
      values.push(filters.from);
      idx++;
    }
    if (filters.to) {
      query += ` AND date <= $${idx}`;
      values.push(filters.to);
      idx++;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (key === 'deleted_at') continue;
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
    if (fields.length === 0) return null;
    values.push(id);
    const query = `
      UPDATE financial_records SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  },
  delete: async (id) => {
    await pool.query(
      `UPDATE financial_records SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
  },
  permanentlyDelete: async (id) => {
    await pool.query('DELETE FROM financial_records WHERE id = $1', [id]);
  }
};

module.exports = FinancialRecord;