const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.isJoi) {
    return res.status(400).json({ error: err.details[0].message });
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }

  // Foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record not found' });
  }

  res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;