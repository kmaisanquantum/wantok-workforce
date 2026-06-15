const { Pool } = require('pg');
const { parse } = require('pg-connection-string');

const getPoolConfig = (overrideHost = null) => {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wantok';
  let config = parse(dbUrl);

  if (overrideHost) {
    console.log(`🛠️ [DB] Manual override: ${overrideHost}`);
    config.host = overrideHost;
  }

  const hostStr = String(config.host);

  // Production Fallback for Coolify Isolation
  if (process.env.NODE_ENV === 'production' && !overrideHost) {
    if (hostStr === 'localhost' || hostStr === '127.0.0.1' || hostStr.includes('.coolify')) {
      console.log(`🚀 [DB] Production Fallback: Routing through public IP 45.32.243.144`);
      config.host = '45.32.243.144';
      config.port = 5432;
    }
  }

  // Detect internal-like hosts
  const finalHost = String(config.host);
  const isInternal =
    finalHost.startsWith('172.') ||
    finalHost.startsWith('192.168.') ||
    finalHost === 'localhost' ||
    finalHost === '127.0.0.1' ||
    finalHost === 'host.docker.internal' ||
    finalHost.includes('postgresql-database-') ||
    finalHost === 'm3j8li3n4e9d2kk2h4c019po'; // The short ID

  if (isInternal) {
    console.log(`🔌 [DB] Internal/Local detected (${config.host}) - Disabling SSL`);
    delete config.ssl;
  } else {
    config.ssl = { rejectUnauthorized: false };
  }

  config.connectionTimeoutMillis = 8000; // Faster timeout for fallback chain
  config.idleTimeoutMillis = 30000;
  config.max = 20;
  config.statement_timeout = 30000;

  return config;
};

let pool;
const initPool = (host = null) => {
  try {
    const config = getPoolConfig(host);
    pool = new Pool(config);
    pool.on('error', (err) => console.error('❌ [DB] Unexpected error on idle client', err));
    return pool;
  } catch (err) {
    console.error('❌ [DB] Failed to initialize pool:', err);
    throw err;
  }
};

pool = initPool();

class UserModel {
  static getPool() { return pool; }

  static reinitPool(newHost) {
    console.log(`🔄 [DB] Re-initializing pool with host: ${newHost}`);
    if (pool) {
      try { pool.end().catch(() => {}); } catch (e) {}
    }
    pool = initPool(newHost);
    return pool;
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
