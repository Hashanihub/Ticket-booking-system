// Use a helper function to get the pool to avoid circular dependencies
const getPool = () => {
  return require('../config/database').pool;
};

const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(userData) {
    const pool = getPool();
    const { name, email, password, phone, role = 'user' } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, phone, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone, role]
    );
    
    return this.findById(result.insertId);
  }

  // Find user by ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Find user by email
  static async findByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user profile
  static async update(id, updateData) {
    const pool = getPool();
    const allowedFields = ['name', 'phone'];
    const fieldsToUpdate = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        fieldsToUpdate[field] = updateData[field];
      }
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      return this.findById(id);
    }

    const setClause = Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(fieldsToUpdate), id];

    await pool.execute(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Find all users (admin only)
  static async findAll(limit = 10, offset = 0) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, is_active, created_at FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  }

  // Count total users
  static async count() {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM users');
    return rows[0].total;
  }
}

module.exports = User;