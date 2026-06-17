const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
const fs = require('fs');
const path = require('path');

// Configuration constants
const CONNECTION_TIMEOUT = 10000; // 10 seconds
const STATEMENT_TIMEOUT = 15000;  // 15 seconds
const SSL_CONFIG = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;

let poolInstance = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: SSL_CONFIG,
  connectionTimeoutMillis: CONNECTION_TIMEOUT,
  statement_timeout: STATEMENT_TIMEOUT
});

async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required but missing.");
  }
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf8') : null;

  const fallbacks = [
    null, // Try default first (native host from DATABASE_URL)
    'host.docker.internal',
    '172.17.0.1',
    '127.0.0.1',
    '45.32.243.144'
  ];

  console.log(`🛠️ [DB Init] NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🛠️ [DB Init] Timeout Settings - Connection: ${CONNECTION_TIMEOUT}ms, Statement: ${STATEMENT_TIMEOUT}ms`);
  console.log(`🛠️ [DB Init] SSL Configuration: ${JSON.stringify(SSL_CONFIG)}`);

  for (const host of fallbacks) {
    try {
      const config = parse(process.env.DATABASE_URL);
      if (host) {
        config.host = host;
      }

      // Force hardening of parameters for every attempt
      config.ssl = SSL_CONFIG;
      config.connectionTimeoutMillis = CONNECTION_TIMEOUT;
      config.statement_timeout = STATEMENT_TIMEOUT;

      const targetHost = config.host || 'unknown';
      const targetPort = config.port;

      console.log(`🔄 [DB Init] Attempting connection to ${targetHost}:${targetPort || "default"} (Fallback: ${!!host})...`);

      poolInstance = new Pool(config);

      // Test the connection
      const client = await poolInstance.connect();
      console.log(`🚀 [DB Init] SUCCESS! Connected to ${targetHost}:${targetPort || "default"}`);

      if (schema) {
        console.log('🔄 [DB Init] Running schema synchronization...');
        await client.query(schema);
        console.log('✅ [DB Init] Database schema synced successfully.');
      } else {
        console.log('⚠️ [DB Init] Warning: schema.sql not found, skipping sync.');
      }

      client.release();
      return; // Success!
    } catch (error) {
      const hostLabel = host || 'native host';
      console.error(`⚠️ [DB Init] Failed for ${hostLabel}: [${error.code || 'NO_CODE'}] ${error.message}`);

      if (error.code === '28P01' || error.code === '28000') {
         console.error('❌ [DB Init] Authentication error detected. Verify DATABASE_URL credentials.');
      }
    }
  }

  throw new Error('All database connection routes failed (including fallbacks). Critical network failure.');
}

module.exports = {
  get pool() { return poolInstance; },
  initializeDatabase
};
