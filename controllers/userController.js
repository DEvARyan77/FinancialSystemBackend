const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendCredentialEmail } = require('../utils/mailer');

exports.createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and Email are required" });
    }

    const tempPassword = crypto.randomBytes(4).toString('hex'); 

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
      name,
      email,
      role: role || 'viewer',
      password: hashedPassword,
      status: 'active'
    });

    try {
      await sendCredentialEmail(email, name, tempPassword, role || 'viewer');
    } catch (mailErr) {
      console.error("User created, but email failed:", mailErr);
      return res.status(201).json({ 
        message: 'User created, but welcome email failed to send.',
        user: newUser 
      });
    }

    res.status(201).json({ 
      message: 'User created and credentials emailed successfully.',
      user: { id: newUser.id || newUser._id, name, email, role } 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const updated = await User.update(id, updates);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};