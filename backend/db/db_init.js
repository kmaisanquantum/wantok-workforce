const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
const fs = require('fs');
const path = require('path');

// Configuration constants
const CONNECTION_TIMEOUT = 10000; // 10 seconds
const STATEMENT_TIMEOUT = 15000;  // 15 seconds
const SSL_CONFIG = false;

let poolInstance;

// Initialize a placeholder pool that will be replaced during initializeDatabase
if (process.env.DATABASE_URL) {
  poolInstance = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: SSL_CONFIG,
    connectionTimeoutMillis: CONNECTION_TIMEOUT,
    statement_timeout: STATEMENT_TIMEOUT
  });
}

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

  const parsedConfig = parse(process.env.DATABASE_URL);
  const originalPort = parsedConfig.port;

  // Define ports to try for each host
  const portsToTry = [originalPort, '3000', '5432'].filter((p, i, a) => p && a.indexOf(p) === i);

  for (const host of fallbacks) {
    for (const port of portsToTry) {
      let tempPool = null;
      try {
        const config = { ...parsedConfig };
        if (host) config.host = host;
        config.port = port;

        // Force hardening of parameters
        config.ssl = SSL_CONFIG;
        config.connectionTimeoutMillis = CONNECTION_TIMEOUT;
        config.statement_timeout = STATEMENT_TIMEOUT;

        const targetHost = config.host || 'unknown';
        const targetPort = config.port || 'default';

        console.log(`🔄 [DB Init] Attempting connection to ${targetHost}:${targetPort} (Fallback: ${!!host})...`);

        tempPool = new Pool(config);

        // Test the connection
        const client = await tempPool.connect();
        console.log(`🚀 [DB Init] SUCCESS! Connected to ${targetHost}:${targetPort}`);

        if (schema) {
          try {
            console.log('🔄 [DB Init] Running schema synchronization (SQL migration)...');
            await client.query(schema);
            console.log('✅ [DB Init] Database schema synced successfully.');
          } catch (syncError) {
            console.error('❌ [DB Init] ERROR during schema sync execution:');
            console.error(`[SQL Error Code: ${syncError.code || 'NO_CODE'}] ${syncError.message}`);
            client.release();
            const wrappedError = new Error('ERROR during schema sync execution: ' + syncError.message); wrappedError.code = syncError.code; throw wrappedError; // Propagate the error so startup fails
          }
        } else {
          console.log('⚠️ [DB Init] Warning: schema.sql not found, skipping sync.');
        }

        client.release();

        // If we had a previous pool, end it
        if (poolInstance && poolInstance !== tempPool) {
          await poolInstance.end().catch(() => {});
        }

        poolInstance = tempPool;
        return; // Success!
      } catch (error) {
        if (tempPool) {
          await tempPool.end().catch(() => {});
        }

        // If the error was a sync error (already handled and thrown), re-throw it to stop the loop
        if (error.message.includes('schema sync execution')) {
          throw error;
        }

        const hostLabel = host || 'native host';
        console.error(`⚠️ [DB Init] Failed for ${hostLabel}:${port}: [${error.code || 'NO_CODE'}] ${error.message}`);

        if (error.code === '28P01' || error.code === '28000') {
           console.error('❌ [DB Init] Authentication error detected. Verify DATABASE_URL credentials.');
        }
      }
    }
  }

  throw new Error('All database connection routes failed (including fallbacks). Critical network failure.');
}

module.exports = {
  get pool() { return poolInstance; },
  initializeDatabase
};
