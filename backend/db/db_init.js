const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function initializeDatabase(pool) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('🔄 Initializing database schema...');
    await client.query(schema);
    console.log('✅ Database schema synchronized successfully.');
  } catch (err) {
    console.error('❌ Failed to synchronize database schema:');
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code);
    if (err.detail) console.error('Error Detail:', err.detail);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { initializeDatabase };
