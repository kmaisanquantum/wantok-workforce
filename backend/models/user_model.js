const { Pool } = require('pg');
const { parse } = require('pg-connection-string');

const getPoolConfig = () => {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wantok';
  console.log('🔍 [DB] Database URL found:', dbUrl.replace(/:[^:]+@/, ':****@'));

  let config = parse(dbUrl);

  // Smarter host detection
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalHost = config.host === 'localhost' || config.host === '127.0.0.1' || config.host === 'host.docker.internal';

  // Detect if the host is a Coolify internal one that might fail (e.g., postgresql-database-...)
  const isCoolifyInternal = config.host && (config.host.startsWith('postgresql-database-') || config.host.includes('.coolify'));

  // We only apply fallback if:
  // 1. It's localhost in production (which usually means the URL wasn't updated)
  // 2. It's a Coolify internal host that is failing with ENOTFOUND in this specific environment
  // 3. OR we are explicitly told to force fallback via env
  const forceFallback = process.env.FORCE_DB_FALLBACK === 'true';
  const shouldFallback = (isProduction && (isLocalHost || isCoolifyInternal)) || forceFallback;

  console.log('🔍 [DB] Host Detection:', {
    host: config.host,
    isProduction,
    isLocalHost,
    isCoolifyInternal,
    forceFallback,
    shouldFallback
  });

  if (shouldFallback) {
    const fallbackHost = process.env.DB_FALLBACK_HOST || 'host.docker.internal';
    console.log(`🛠️ [DB] Applying resilience routing. Target was: ${config.host}. Fallback: ${fallbackHost}`);
    config.host = fallbackHost;

    // Disable SSL for host.docker.internal to avoid handshake issues on internal bridge
    if (config.host === 'host.docker.internal') {
      console.log('🔌 [DB] Disabling SSL for internal Docker bridge communication');
      delete config.ssl;
    } else {
      config.ssl = {
        rejectUnauthorized: false
      };
    }
  } else {
    console.log(`✅ [DB] Using primary host: ${config.host}`);
    // Still apply SSL if it's a remote host and not localhost/internal
    if (!isLocalHost) {
        config.ssl = {
            rejectUnauthorized: false
        };
    }
  }

  // Enhanced Resilience Settings
  config.connectionTimeoutMillis = 15000; // 15 seconds to connect
  config.idleTimeoutMillis = 30000;
  config.max = 20;
  config.statement_timeout = 30000; // 30 seconds per query

  return config;
};

let pool;
try {
    pool = new Pool(getPoolConfig());
    pool.on('error', (err, client) => {
        console.error('❌ [DB] Unexpected error on idle client', err);
    });
} catch (err) {
    console.error('❌ [DB] Failed to initialize pool:', err);
}

module.exports.pool = pool;

class UserModel {
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
      console.error('❌ [DB] UserModel.create Error:', e.message);
      throw e;
    } finally {
      if (client) client.release();
    }
  }

  static async findByIdentifier(identifier) {
    const query = 'SELECT u.*, array_agg(ur.role_name) as roles FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id WHERE u.email = $1 OR u.phone_number = $1 GROUP BY u.id';
    try {
      const { rows } = await pool.query(query, [identifier]);
      return rows[0];
    } catch (e) {
      console.error('❌ [DB] UserModel.findByIdentifier Error:', e.message);
      throw e;
    }
  }

  static async findById(id) {
    const query = 'SELECT u.*, array_agg(ur.role_name) as roles FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id WHERE u.id = $1 GROUP BY u.id';
    try {
      const { rows } = await pool.query(query, [id]);
      return rows[0];
    } catch (e) {
      console.error('❌ [DB] UserModel.findById Error:', e.message);
      throw e;
    }
  }

  static async updateActivePersona(userId, persona) {
    const query = 'UPDATE users SET active_persona = $2 WHERE id = $1 RETURNING active_persona';
    try {
      const { rows } = await pool.query(query, [userId, persona]);
      return rows[0];
    } catch (e) {
      console.error('❌ [DB] UserModel.updateActivePersona Error:', e.message);
      throw e;
    }
  }

  static async addRole(userId, role) {
    const query = 'INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2) ON CONFLICT DO NOTHING';
    try {
      await pool.query(query, [userId, role]);
    } catch (e) {
      console.error('❌ [DB] UserModel.addRole Error:', e.message);
      throw e;
    }
  }
}

module.exports = UserModel;
module.exports.pool = pool;
