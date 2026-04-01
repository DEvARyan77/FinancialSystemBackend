const FinancialRecord = require('../models/FinancialRecord');

exports.create = (req, res) => {
  const { amount, type, category, date, description } = req.body;
  const userId = req.user.id;
  try {
    const record = FinancialRecord.create({ amount, type, category, date, description, user_id: userId });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.list = (req, res) => {
  const { type, category, from, to, limit = 100, offset = 0 } = req.query;
  const userId = req.user.id;
  // For admin, maybe allow seeing all? We'll implement later.
  const records = FinancialRecord.findByUser(userId, { type, category, from, to, limit, offset });
  res.json(records);
};

exports.getById = (req, res) => {
  const record = FinancialRecord.findById(req.params.id);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  // Ensure user owns the record or is admin (add later)
  if (record.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(record);
};

exports.update = (req, res) => {
  const record = FinancialRecord.findById(req.params.id);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  if (record.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const updated = FinancialRecord.update(req.params.id, req.body);
  res.json(updated);
};

exports.deleteRecord = (req, res) => {
  const record = FinancialRecord.findById(req.params.id);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  if (record.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  FinancialRecord.delete(req.params.id);
  res.status(204).send();
};