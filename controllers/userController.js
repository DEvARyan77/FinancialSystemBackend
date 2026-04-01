const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.listUsers = (req, res) => {
  const users = User.findAll();
  res.json(users);
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }
  User.update(id, updates);
  res.json(User.findById(id));
};

exports.deleteUser = (req, res) => {
  User.delete(req.params.id);
  res.status(204).send();
};