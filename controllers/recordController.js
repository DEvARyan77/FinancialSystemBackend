const FinancialRecord = require('../models/FinancialRecord');
const { clearUserDashboardCache } = require('../utils/cache');

exports.create = async (req, res) => {
  const { amount, type, category, date, description } = req.body;
  const userId = req.user.id;
  try {
    const record = await FinancialRecord.create({ amount, type, category, date, description, user_id: userId });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  await clearUserDashboardCache(req.user.id);
  res.status(201).json(record);
};

exports.list = async (req, res) => {
  const { type, category, from, to, limit = 100, offset = 0 } = req.query;
  console.log('Received query parameters:', { type, category, from, to, limit, offset }); // ← add this
  let userId = null;
  try {
    const records = await FinancialRecord.findByUser(userId, { type, category, from, to, limit, offset });
    const total = records.length; 
    console.log(`Fetched ${records.length} records for user ${userId} with filters:`, { type, category, from, to, limit, offset }); // ← add this
    console.log(`Total records matching filters: ${total}`); // ← add this
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
    if (record.user_id !== req.user.id && (req.user.role !== 'admin' || req.user.role !== 'analyst')) {
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
  await clearUserDashboardCache(req.user.id);
  res.json(updated);
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
  await clearUserDashboardCache(req.user.id);
  res.status(204).send();
};