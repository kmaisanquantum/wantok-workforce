const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wantok',
});

class UserModel {
  static async create(userData) {
    const { name, phone, email, passwordHash } = userData;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const userQuery = `
        INSERT INTO users (name, phone_number, email, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, phone_number, active_persona
      `;
      const { rows } = await client.query(userQuery, [name, phone, email, passwordHash]);
      const user = rows[0];

      await client.query('COMMIT');
      return user;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async findByIdentifier(identifier) {
    const query = `
      SELECT u.*, array_agg(ur.role_name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.email = $1 OR u.phone_number = $1
      GROUP BY u.id
    `;
    const { rows } = await pool.query(query, [identifier]);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT u.*, array_agg(ur.role_name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.id = $1
      GROUP BY u.id
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async updateActivePersona(userId, persona) {
    const query = 'UPDATE users SET active_persona = $2 WHERE id = $1 RETURNING active_persona';
    const { rows } = await pool.query(query, [userId, persona]);
    return rows[0];
  }

  static async addRole(userId, role) {
    const query = 'INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2) ON CONFLICT DO NOTHING';
    await pool.query(query, [userId, role]);
  }
}

module.exports = UserModel;
