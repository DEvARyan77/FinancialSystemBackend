const Joi = require('joi');

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query);
  if (error) {
    console.log('Validation error:', error.details[0].message); // ← add this
    return res.status(400).json({ error: error.details[0].message });
  }
  req.validatedQuery = value;
  next();
};

const recordListQuerySchema = Joi.object({
  type: Joi.string().valid('income', 'expense', '').optional().allow(''),
  category: Joi.string().optional().allow(''),
  from: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().isoDate(),
    Joi.string().pattern(/^\d{2}-\d{2}-\d{4}$/)
  ).optional().allow(''),
  to: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().isoDate(),
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
  ).optional().allow(''),
  limit: Joi.number().integer().min(1).max(1000).default(100),
  offset: Joi.number().integer().min(0).default(0),
  all: Joi.string().valid('true', 'false').optional()
}).unknown(true);  

module.exports = { validateQuery, recordListQuerySchema };