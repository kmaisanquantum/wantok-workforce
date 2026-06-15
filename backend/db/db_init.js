const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
const fs = require('fs');
const path = require('path');

let poolInstance = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  connectionTimeoutMillis: 5000
});

async function initializeDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const fallbacks = [
    null, // Try default first
    'host.docker.internal',
    '172.17.0.1',
    '127.0.0.1',
    '45.32.243.144'
  ];

  for (const host of fallbacks) {
    try {
      if (host) {
        console.log(`🔄 Attempting fallback connection to host: ${host}...`);
        const config = parse(process.env.DATABASE_URL || '');
        config.host = host;
        config.ssl = false;
        config.connectionTimeoutMillis = 5000;
        poolInstance = new Pool(config);
      } else {
        console.log("🔄 Connecting natively using process.env.DATABASE_URL...");
      }

      const client = await poolInstance.connect();
      console.log(`🚀 DATABASE CONNECTION SUCCESSFUL! (via ${host || 'native host'})`);

      console.log('🔄 Running schema synchronization...');
      await client.query(schema);
      console.log('✅ [Ready] Database synced.');

      client.release();
      return; // Success!
    } catch (error) {
      console.error(`⚠️ Connection failed for ${host || 'native host'}: [${error.code || 'NO_CODE'}] ${error.message}`);
      if (error.code !== 'ENOTFOUND' && error.code !== 'ECONNREFUSED' && !error.message.includes('timeout')) {
        // If it's a real error (auth, etc.), stop and throw
        throw error;
      }
      // Otherwise, continue to next fallback
    }
  }

  throw new Error('All database connection routes failed (including fallbacks).');
}

module.exports = {
  get pool() { return poolInstance; },
  initializeDatabase
};
