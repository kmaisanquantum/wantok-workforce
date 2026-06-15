const fs = require('fs');
const path = require('path');
const UserModel = require('../models/user_model');

async function initializeDatabase(initialPool) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const database = initialPool.options.database;
  const initialHost = initialPool.options.host;

  // Hyper-Resilient Fallback Chain
  const fallbackHosts = [
    'm3j8li3n4e9d2kk2h4c019po', // Short internal alias
    '172.17.0.1',             // Docker Default Bridge
    '172.18.0.1'              // Coolify Bridge
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
