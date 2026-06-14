const { Pool } = require('pg');
const { parse } = require('pg-connection-string');

const getPoolConfig = (overrideHost = null) => {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wantok';

  let config = parse(dbUrl);

  if (overrideHost) {
    console.log(`🛠️ [DB] Applying manual override host: ${overrideHost}`);
    config.host = overrideHost;
  } else {
    // Smarter host detection
    const isProduction = process.env.NODE_ENV === 'production';
    const isLocalHost = config.host === 'localhost' || config.host === '127.0.0.1';
    const isCoolifyInternal = config.host && (config.host.startsWith('postgresql-database-') || config.host.includes('.coolify'));

    const forceFallback = process.env.FORCE_DB_FALLBACK === 'true';
    const shouldFallback = (isProduction && (isLocalHost || isCoolifyInternal)) || forceFallback;

    if (shouldFallback) {
      // Default to Docker bridge gateway IP instead of hostname
      const fallbackHost = process.env.DB_FALLBACK_HOST || '172.17.0.1';
      console.log(`🛠️ [DB] Applying resilience routing. Target was: ${config.host}. Fallback: ${fallbackHost}`);
      config.host = fallbackHost;
    }
  }

  // Handle SSL logic
  const isInternalIP = config.host === '172.17.0.1' || config.host === '172.18.0.1' || config.host === 'localhost' || config.host === '127.0.0.1';

  if (isInternalIP) {
    console.log(`🔌 [DB] Disabling SSL for internal/local communication (${config.host})`);
    delete config.ssl;
  } else {
    config.ssl = { rejectUnauthorized: false };
  }

  config.connectionTimeoutMillis = 15000;
  config.idleTimeoutMillis = 30000;
  config.max = 20;
  config.statement_timeout = 30000;

  return config;
};

let pool;
const initPool = (overrideHost = null) => {
  try {
    const config = getPoolConfig(overrideHost);
    pool = new Pool(config);
    pool.on('error', (err) => console.error('❌ [DB] Unexpected error on idle client', err));
    module.exports.pool = pool;
    return pool;
  } catch (err) {
    console.error('❌ [DB] Failed to initialize pool:', err);
    throw err;
  }
};

// Initial setup
initPool();

class UserModel {
  static getPool() {
    return pool;
  }

  static reinitPool(overrideHost) {
    console.log(`🔄 [DB] Re-initializing pool with host: ${overrideHost}`);
    if (pool) pool.end().catch(() => {});
    return initPool(overrideHost);
  }

  static async checkConnection() {
    if (!pool) return false;
    try {
      const client = await pool.connect();
      try {
        await client.query('SELECT NOW()');
        return true;
      } finally {
        client.release();
      }
    } catch (e) {
      console.error('❌ [DB] checkConnection Error:', e.message);
      return false;
    }
  }

  static async create(userData) {
    const { name, phone, email, passwordHash } = userData;
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const userQuery = 'INSERT INTO users (name, phone_number, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone_number, active_persona';
      const { rows } = await client.query(userQuery, [name, phone, email, passwordHash]);
      const user = rows[0];
      await client.query('COMMIT');
      return user;
    } catch (e) {
      if (client) await client.query('ROLLBACK');
      throw e;
    } finally {
      if (client) client.release();
    }
  }

  static async findByIdentifier(identifier) {
    const query = 'SELECT u.*, array_agg(ur.role_name) as roles FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id WHERE u.email = $1 OR u.phone_number = $1 GROUP BY u.id';
    const { rows } = await pool.query(query, [identifier]);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT u.*, array_agg(ur.role_name) as roles FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id WHERE u.id = $1 GROUP BY u.id';
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
