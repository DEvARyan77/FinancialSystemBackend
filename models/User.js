const db = require('../config/db');

const User = {
  create: (user) => {
    const stmt = db.prepare(`INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)`);
    const info = stmt.run(user.name, user.email, user.password, user.role, user.status || 'active');
    return { id: info.lastInsertRowid, ...user };
  },
  findByEmail: (email) => {
    return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
  },
  findById: (id) => {
    return db.prepare(`SELECT id, name, email, role, status, created_at FROM users WHERE id = ?`).get(id);
  },
  findAll: () => {
    return db.prepare(`SELECT id, name, email, role, status, created_at FROM users`).all();
  },
  update: (id, data) => {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    values.push(id);
    const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    return stmt.run(...values);
  },
  delete: (id) => {
    return db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
  }
};
module.exports = User;