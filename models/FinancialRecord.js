const db = require('../config/db');

const FinancialRecord = {
  create: (record) => {
    const stmt = db.prepare(`
      INSERT INTO financial_records (amount, type, category, date, description, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(record.amount, record.type, record.category, record.date, record.description, record.user_id);
    return { id: info.lastInsertRowid, ...record };
  },
  findById: (id) => {
    return db.prepare(`SELECT * FROM financial_records WHERE id = ?`).get(id);
  },
  findByUser: (userId, filters = {}) => {
    let query = `SELECT * FROM financial_records WHERE user_id = ?`;
    const params = [userId];
    if (filters.type) {
      query += ` AND type = ?`;
      params.push(filters.type);
    }
    if (filters.category) {
      query += ` AND category = ?`;
      params.push(filters.category);
    }
    if (filters.from) {
      query += ` AND date >= ?`;
      params.push(filters.from);
    }
    if (filters.to) {
      query += ` AND date <= ?`;
      params.push(filters.to);
    }
    query += ` ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(filters.limit || 100), parseInt(filters.offset || 0));
    return db.prepare(query).all(...params);
  },
  update: (id, data) => {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    values.push(id);
    const stmt = db.prepare(`UPDATE financial_records SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    return FinancialRecord.findById(id);
  },
  delete: (id) => {
    return db.prepare(`DELETE FROM financial_records WHERE id = ?`).run(id);
  }
};

module.exports = FinancialRecord;