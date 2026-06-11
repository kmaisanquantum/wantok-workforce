const { Pool } = require('pg');

// Database pool configuration (assumes standard environment variables)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wantok',
});

class UserModel {
  /**
   * Create a new user with role-based logic
   */
  static async create(userData) {
    const {
      name,
      phone,
      email,
      passwordHash,
      role,
      locationName,
      primarySkill
    } = userData;

    const query = `
      INSERT INTO users (name, phone_number, email, password_hash, role, location_name, primary_skill)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, phone_number, role, primary_skill, location_name
    `;

    const values = [name, phone, email, passwordHash, role, locationName, primarySkill];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  /**
   * Find user by email or phone (identifier) for login
   */
  static async findByIdentifier(identifier) {
    const query = `
      SELECT * FROM users
      WHERE email = $1 OR phone_number = $1
    `;
    const { rows } = await pool.query(query, [identifier]);
    return rows[0];
  }
}

module.exports = UserModel;
