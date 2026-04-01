const FinancialRecord = require('../models/FinancialRecord');

exports.create = async (req, res) => {
  const { amount, type, category, date, description } = req.body;
  const userId = req.user.id;
  try {
    const record = await FinancialRecord.create({ amount, type, category, date, description, user_id: userId });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  const { type, category, from, to, limit = 100, offset = 0 } = req.query;
  let userId = req.user.id;
  if (req.user.role === 'admin' && req.query.all === 'true') {
    userId = null;
  }
  try {
    const records = await FinancialRecord.findByUser(userId, { type, category, from, to, limit, offset });
    const total = await FinancialRecord.countByUser(userId, { type, category, from, to });
    res.json({
      data: records,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const record = await FinancialRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    if (record.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const record = await FinancialRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    if (record.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const updated = await FinancialRecord.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const record = await FinancialRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    if (record.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await FinancialRecord.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};