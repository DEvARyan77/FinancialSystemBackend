const pool = require('../config/db');
const cache = require('../middlewares/cache');

exports.summary = async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as totalIncome,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as totalExpenses
      FROM financial_records
      WHERE user_id = $1 AND deleted_at IS NULL
    `;
    const result = await pool.query(query, [userId]);
    const totals = result.rows[0];
    const netBalance = totals.totalincome - totals.totalexpenses;
    res.json({
      totalIncome: parseFloat(totals.totalincome),
      totalExpenses: parseFloat(totals.totalexpenses),
      netBalance
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.categoryTotals = async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
      SELECT category, type, SUM(amount) as total
      FROM financial_records
      WHERE user_id = $1 AND deleted_at IS NULL
      GROUP BY category, type
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.recentActivity = async (req, res) => {
  const userId = req.user.id;
  const limit = req.query.limit || 5;
  try {
    const query = `
      SELECT * FROM financial_records
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY date DESC, created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.trends = async (req, res) => {
  const userId = req.user.id;
  const period = req.query.period || 'month';
  let dateFormat;
  if (period === 'month') dateFormat = 'YYYY-MM';
  else dateFormat = 'YYYY-IW'; // week of year

  try {
    const query = `
      SELECT
        TO_CHAR(date, $1) as period,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
      FROM financial_records
      WHERE user_id = $2 AND deleted_at IS NULL
      GROUP BY period
      ORDER BY period DESC
      LIMIT 12
    `;
    const result = await pool.query(query, [dateFormat, userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};