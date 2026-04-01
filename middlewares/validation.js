const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const schemas = {
  register: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('viewer', 'analyst', 'admin').default('viewer')
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  createRecord: Joi.object({
    amount: Joi.number().positive().required(),
    type: Joi.string().valid('income', 'expense').required(),
    category: Joi.string().required(),
    date: Joi.date().iso().required(),
    description: Joi.string().optional()
  }),
  updateRecord: Joi.object({
    amount: Joi.number().positive(),
    type: Joi.string().valid('income', 'expense'),
    category: Joi.string(),
    date: Joi.date().iso(),
    description: Joi.string()
  }).min(1)
};

module.exports = { validate, schemas };