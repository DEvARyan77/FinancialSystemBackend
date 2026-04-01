const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.isJoi) {
    return res.status(400).json({ error: err.details[0].message });
  }
  
  if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE')) {
    return res.status(409).json({ error: 'Duplicate entry' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;