const fs = require('fs');
const path = require('path');

async function initializeDatabase(pool) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const host = pool.options.host;
  const database = pool.options.database;

  console.log(`🔄 [DB Handshake] Attempting direct connection to ${host}/${database}...`);

  try {
    const client = await pool.connect();
    console.log(`🔗 [Success] Database reached successfully via: ${host}`);

    try {
      console.log('🔄 Running schema synchronization...');
      await client.query(schema);
      console.log('✅ [Ready] Database synced.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ [Critical] Database connection failed.');
    console.error(`Target Host: ${host}`);
    console.error(`Target Database: ${database}`);
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code);
    throw err;
  }
}

module.exports = { initializeDatabase };
