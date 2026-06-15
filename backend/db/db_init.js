const fs = require('fs');
const path = require('path');
const UserModel = require('../models/user_model');

async function initializeDatabase(pool) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const database = pool.options.database;
  const initialHost = pool.options.host;

  // Optimized Fallback Chain: [Primary, Detected Gateway (via server logic), 172.17.0.1, 172.18.0.1, 172.19.0.1, 192.168.0.1]
  const fallbackHosts = [
    '172.17.0.1',
    '172.18.0.1',
    '172.19.0.1',
    '192.168.0.1'
  ];

  const tryConnect = async (hostToTry) => {
    console.log(`🔄 [DB Handshake] Attempting connection to ${hostToTry}/${database}...`);
    const currentPool = (hostToTry === initialHost) ? pool : UserModel.reinitPool(hostToTry);

    try {
      const client = await currentPool.connect();
      console.log(`🔗 [Connected] Successfully reached database via: ${hostToTry}`);

      try {
        await client.query(schema);
        console.log('✅ [Synced] Database schema is ready.');
        return true;
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn(`⚠️ [Failed] Connection to ${hostToTry} timed out or was refused.`);
      return false;
    }
  };

  // 1. Try Primary (which may already be a fallback IP if detected by model)
  if (await tryConnect(initialHost)) return;

  // 2. Iterate through sequential fallbacks
  for (const fallback of fallbackHosts) {
    if (fallback === initialHost) continue; // Skip if we already tried it
    if (await tryConnect(fallback)) return;
  }

  console.error('❌ [Critical] All database connection attempts in the fallback chain have failed.');
  throw new Error('Database unreachable across all known internal bridge gateways.');
}

module.exports = { initializeDatabase };
