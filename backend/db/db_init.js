const fs = require('fs');
const path = require('path');
const UserModel = require('../src/auth/models/user_model');

async function initializeDatabase(initialPool) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf8') : null;

  const fallbacks = [
    null, // Try default first (native host from DATABASE_URL)
    'host.docker.internal',
    '192.168.0.1', // Gateway IP (common in devbox/docker)
    '172.17.0.1', '172.18.0.1',  // Docker bridge default
    '127.0.0.1',
    '45.32.243.144'
  ];

  const performHandshake = async (host) => {
    console.log(`🔄 [DB Handshake] Probing host: ${host}...`);
    const pool = (host === initialHost) ? initialPool : UserModel.reinitPool(host);

    try {
      const client = await pool.connect();
      console.log(`🔗 [Success] Database reached via: ${host}`);

      try {
        console.log('🔄 Running schema synchronization...');
        await client.query(schema);
        console.log('✅ [Ready] Database synced.');
        return true;
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn(`⚠️ [Failed] Host ${host} unreachable: ${err.message}`);
      return false;
    }
  };

  // 1. Try initial host from env
  if (await performHandshake(initialHost)) return;

  // 2. Iterate fallbacks
  for (const host of fallbackHosts) {
    if (host === initialHost) continue;
    if (await performHandshake(host)) return;
  }

  throw new Error('All database fallback routes failed. Critical network failure.');
}

module.exports = { initializeDatabase };
