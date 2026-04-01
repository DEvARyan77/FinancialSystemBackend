const db = require('../config/db');

exports.summary = (req, res) => {
  const userId = req.user.id;
  // For simplicity, only user's own records. Admin could see all if needed.
  let query = `
    SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpenses
    FROM financial_records
    WHERE user_id = ?
  `;
  const totals = db.prepare(query).get(userId);
  const netBalance = (totals.totalIncome || 0) - (totals.totalExpenses || 0);
  res.json({
    totalIncome: totals.totalIncome || 0,
    totalExpenses: totals.totalExpenses || 0,
    netBalance
  });
};

exports.categoryTotals = (req, res) => {
  const userId = req.user.id;
  const query = `
    SELECT category, type, SUM(amount) as total
    FROM financial_records
    WHERE user_id = ?
    GROUP BY category, type
  `;
  const rows = db.prepare(query).all(userId);
  res.json(rows);
};

exports.recentActivity = (req, res) => {
  const userId = req.user.id;
  const limit = req.query.limit || 5;
  const query = `
    SELECT * FROM financial_records
    WHERE user_id = ?
    ORDER BY date DESC, created_at DESC
    LIMIT ?
  `;
  const rows = db.prepare(query).all(userId, limit);
  res.json(rows);
};

exports.trends = (req, res) => {
  const userId = req.user.id;
  const period = req.query.period || 'month'; // month or week
  let dateFormat;
  if (period === 'month') dateFormat = '%Y-%m';
  else dateFormat = '%Y-%W';
  const query = `
    SELECT strftime('${dateFormat}', date) as period,
           SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
           SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM financial_records
    WHERE user_id = ?
    GROUP BY period
    ORDER BY period DESC
    LIMIT 12
  `;
  const rows = db.prepare(query).all(userId);
  res.json(rows);
};