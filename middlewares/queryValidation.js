const Joi = require('joi');

const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const recordListQuerySchema = Joi.object({
  type: Joi.string().valid('income', 'expense').optional(),
  category: Joi.string().optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  limit: Joi.number().integer().min(1).max(1000).default(100),
  offset: Joi.number().integer().min(0).default(0),
  all: Joi.string().valid('true', 'false').optional()
});

module.exports = { validateQuery, recordListQuerySchema };