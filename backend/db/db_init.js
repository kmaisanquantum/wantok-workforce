const fs = require('fs');
const path = require('path');
const UserModel = require('../models/user_model');

async function initializeDatabase(pool) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  let currentPool = pool;
  let host = currentPool.options.host;
  const database = currentPool.options.database;

  console.log(`🔄 Attempting database handshake to ${host}/${database}...`);

  try {
    const client = await currentPool.connect();
    console.log(`🔗 Database connected successfully! (Host: ${host})`);

    try {
      console.log('🔄 Running schema synchronization...');
      await client.query(schema);
      console.log('✅ Database handshake completely successful!');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn(`⚠️ Connection failed to ${host}: ${err.message}`);

    // Final Bulletproof Fallback Chain
    if (host !== '172.18.0.1') {
      const nextHost = (host === '172.17.0.1') ? '172.18.0.1' : '172.17.0.1';
      console.log(`📡 [Fallback] Attempting secondary bridge gateway: ${nextHost}...`);

      try {
        const newPool = UserModel.reinitPool(nextHost);
        const client = await newPool.connect();
        console.log(`🔗 [Success] Connected via fallback bridge: ${nextHost}`);

        try {
          await client.query(schema);
          console.log('✅ Database schema synchronized via fallback.');
          return; // Success
        } finally {
          client.release();
        }
      } catch (fallbackErr) {
        console.error(`❌ [Critical] Fallback to ${nextHost} also failed: ${fallbackErr.message}`);
        throw fallbackErr;
      }
    } else {
      throw err;
    }
  }
}

module.exports = { initializeDatabase };
