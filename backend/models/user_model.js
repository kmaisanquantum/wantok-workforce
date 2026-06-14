const { Pool } = require('pg');
const { parse } = require('pg-connection-string');

const getPoolConfig = () => {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wantok';
  let config = parse(dbUrl);

  // Coolify Container Name Lookup Bug Fallback
  // If we're in production or the host looks like a long internal Coolify name,
  // we add a fallback mechanism in the connection attempt or simply use the IP.
  const isInternalCoolifyHost = config.host && config.host.includes('.coolify');

  if (process.env.NODE_ENV === 'production' || isInternalCoolifyHost) {
    console.log(`🛠️ Detected internal host ${config.host}, preparing fallback routing...`);
    // Direct fallback to host bridge or public IP
    config.host = process.env.DB_FALLBACK_HOST || '45.32.243.144';
    console.log(`📡 Using fallback host: ${config.host}`);

    config.ssl = {
      rejectUnauthorized: false
    };
  }

  return config;
};

const pool = new Pool(getPoolConfig());

// Export pool for initialization
module.exports.pool = pool;

class UserModel {
  static async checkConnection() {
    const client = await pool.connect();
    try {
      await client.query('SELECT NOW()');
      return true;
    } finally {
      client.release();
    }
  }

  static async create(userData) {
    const { name, phone, email, passwordHash } = userData;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const userQuery = 'INSERT INTO users (name, phone_number, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone_number, active_persona';
      const { rows } = await client.query(userQuery, [name, phone, email, passwordHash]);
      const user = rows[0];

      await client.query('COMMIT');
      return user;
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('UserModel.create Error:', e.message);
      throw e;
    } finally {
      client.release();
    }
  }

  static async findByIdentifier(identifier) {
    const query = 'SELECT u.*, array_agg(ur.role_name) as roles FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id WHERE u.email = $1 OR u.phone_number = $1 GROUP BY u.id';
    try {
      const { rows } = await pool.query(query, [identifier]);
      return rows[0];
    } catch (e) {
      console.error('UserModel.findByIdentifier Error:', e.message);
      throw e;
    }
  }

  static async findById(id) {
    const query = 'SELECT u.*, array_agg(ur.role_name) as roles FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id WHERE u.id = $1 GROUP BY u.id';
    try {
      const { rows } = await pool.query(query, [id]);
      return rows[0];
    } catch (e) {
      console.error('UserModel.findById Error:', e.message);
      throw e;
    }
  }

  static async updateActivePersona(userId, persona) {
    const query = 'UPDATE users SET active_persona = $2 WHERE id = $1 RETURNING active_persona';
    try {
      const { rows } = await pool.query(query, [userId, persona]);
      return rows[0];
    } catch (e) {
      console.error('UserModel.updateActivePersona Error:', e.message);
      throw e;
    }
  }

  static async addRole(userId, role) {
    const query = 'INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2) ON CONFLICT DO NOTHING';
    try {
      await pool.query(query, [userId, role]);
    } catch (e) {
      console.error('UserModel.addRole Error:', e.message);
      throw e;
    }
  }
}

module.exports = UserModel;
// Ensure we re-export pool since we overwrote module.exports
module.exports.pool = pool;
