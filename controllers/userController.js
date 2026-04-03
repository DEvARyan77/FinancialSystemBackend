const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendCredentialEmail, sendPasswordResetEmail } = require('../utils/mailer');

exports.createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and Email are required" });
    }
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
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
      console.log(`Attempting to send email to ${email}...`);
      await sendCredentialEmail(email, name, tempPassword, role || 'viewer');
      console.log("Email sent successfully.");
    } catch (mailErr) {
      console.error("NODEMAILER ERROR:", mailErr);
      
      return res.status(201).json({ 
        message: 'User created, but welcome email failed to send.',
        user: newUser,
        error: mailErr.message 
      });
    }

    res.status(201).json({ 
      message: 'User created and credentials emailed successfully.',
      user: newUser 
    });

  } catch (err) {
    console.error("CREATE USER ERROR:", err);
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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required to reset password." });
    }

    // 1. Check if the user exists
    const user = await User.findByEmail(email);
    if (!user) {
      // For security, you can also return a 200 success here so attackers don't know 
      // which emails exist, but for an internal app, a 404 is easier for users to understand.
      return res.status(404).json({ error: "No account found with that email address." });
    }

    // 2. Generate a new temporary password
    const tempPassword = crypto.randomBytes(4).toString('hex'); 
    
    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 4. Update the user's password in the database
    // Note: We use your existing User.update model method
    await User.update(user.id, { password: hashedPassword });

    // 5. Send the reset email
    try {
      console.log(`Attempting to send password reset email to ${email}...`);
      await sendPasswordResetEmail(email, user.name, tempPassword);
      console.log("Password reset email sent successfully.");
    } catch (mailErr) {
      console.error("NODEMAILER ERROR (Reset):", mailErr);
      return res.status(500).json({ 
        error: "Password was reset in the database, but the email failed to send. Please contact an admin." 
      });
    }

    // 6. Respond to the frontend
    res.status(200).json({ 
      message: "A new temporary password has been sent to your email address." 
    });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ error: "An error occurred while resetting the password." });
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