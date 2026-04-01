const db = require('../config/db');

const FinancialRecord = {
  // Create a new financial record
  create: (record) => {
    const stmt = db.prepare(`
      INSERT INTO financial_records (amount, type, category, date, description, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(record.amount, record.type, record.category, record.date, record.description, record.user_id);
    return { id: info.lastInsertRowid, ...record };
  },

  // Find a record by ID (only if not soft-deleted)
  findById: (id) => {
    return db.prepare(`
      SELECT * FROM financial_records
      WHERE id = ? AND deleted_at IS NULL
    `).get(id);
  },

  // Find records by user with filters (excludes soft-deleted)
  findByUser: (userId, filters = {}) => {
    let query = `SELECT * FROM financial_records WHERE deleted_at IS NULL`;
    const params = [];

    if (userId !== null) {
      query += ` AND user_id = ?`;
      params.push(userId);
    }

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

  // Count records for pagination (excludes soft-deleted)
  countByUser: (userId, filters = {}) => {
    let query = `SELECT COUNT(*) as total FROM financial_records WHERE deleted_at IS NULL`;
    const params = [];

    if (userId !== null) {
      query += ` AND user_id = ?`;
      params.push(userId);
    }
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

    const result = db.prepare(query).get(...params);
    return result.total;
  },

  // Update a record (cannot update deleted_at)
  update: (id, data) => {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      // Prevent accidentally setting deleted_at via update
      if (key === 'deleted_at') continue;
      fields.push(`${key} = ?`);
      values.push(value);
    }
    if (fields.length === 0) return null; // nothing to update

    values.push(id);
    const stmt = db.prepare(`UPDATE financial_records SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`);
    stmt.run(...values);
    return FinancialRecord.findById(id);
  },

  // Soft delete: mark as deleted instead of removing
  delete: (id) => {
    const stmt = db.prepare(`
      UPDATE financial_records
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted_at IS NULL
    `);
    const result = stmt.run(id);
    return result.changes > 0;
  },

  // Optional: permanently delete (for admin cleanup)
  permanentlyDelete: (id) => {
    const stmt = db.prepare(`DELETE FROM financial_records WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

module.exports = FinancialRecord;