const fs = require('fs');
const path = require('path');

async function initializeDatabase(pool) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Capture current connection config for trace
  const host = pool.options.host;
  const database = pool.options.database;

  console.log(`🔄 Attempting database handshake to ${host}/${database}...`);

  try {
    const client = await pool.connect();
    console.log(`🔗 Database connected successfully to host via backup routing! (Host: ${host})`);

    try {
      console.log('🔄 Running schema synchronization...');
      await client.query(schema);
      console.log('✅ Database handshake completely successful!');
      console.log('✅ Database schema synchronized.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Database connection failed details:');
    console.error(`Target Host: ${host}`);
    console.error(`Target Database: ${database}`);
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code);
    if (err.detail) console.error('Error Detail:', err.detail);
    throw err;
  }
}

module.exports = { initializeDatabase };
