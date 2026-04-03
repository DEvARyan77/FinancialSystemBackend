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
  findByUser: async (userID, filters = {}) => {
    let query = `SELECT * FROM financial_records WHERE deleted_at IS NULL`;
    const values = [];
    let idx = 1; 
    const formatDbDate = (dateStr) => {
      if (dateStr && typeof dateStr === 'string') {
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      return dateStr;
    };

    if (filters.type && filters.type !== '') {
      query += ` AND type ILIKE $${idx}`; 
      values.push(`%${filters.type}%`); 
      idx++;
    }
    if (filters.category && filters.category !== '') {
      query += ` AND category ILIKE $${idx}`; 
      // Add '%' wildcards to the front and back of the search term
      values.push(`%${filters.category}%`); 
      idx++;
    }
    if (filters.from && filters.from !== '') {
      query += ` AND date >= $${idx}`; 
      values.push(formatDbDate(filters.from));
      idx++;
    }
    if (filters.to && filters.to !== '') {
      query += ` AND date <= $${idx}`; 
      values.push(formatDbDate(filters.to));
      idx++;
    }
    
    query += ` ORDER BY date DESC, created_at DESC LIMIT $${idx}::int OFFSET $${idx+1}::int`;
    values.push(parseInt(filters.limit || 100), parseInt(filters.offset || 0));

    console.log('Constructed SQL query:', query); // ← add this
    console.log('With values:', values); // ← add this

    const result = await pool.query(query, values);
    return result.rows;
  },
  countByUser: async (userId, filters = {}) => {
    let query = `SELECT COUNT(*) as total FROM financial_records WHERE deleted_at IS NULL`;
    const values = [];
    let idx = 2;

    if (filters.type && filters.type !== '') {
      query += ` AND type = ${idx}`;
      values.push(filters.type);
      idx++;
    }
    if (filters.category && filters.category !== '') {
      query += ` AND category = ${idx}`;
      values.push(filters.category);
      idx++;
    }
    if (filters.from && filters.from !== '') {
      query += ` AND date >= ${idx}`;
      values.push(filters.from);
      idx++;
    }
    if (filters.to && filters.to !== '') {
      query += ` AND date <= ${idx}`;
      values.push(filters.to);
      idx++;
    }

    const result = await pool.query(query, values);
    console.log(query)
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