const fs = require('fs');
const path = require('path');

async function initializeDatabase(pool) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  console.log('🔄 Attempting database handshake...');
  const client = await pool.connect();
  try {
    console.log('🔗 Database connected. Running schema sync...');
    await client.query(schema);
    console.log('✅ Database handshake completely successful!');
    console.log('✅ Database schema synchronized.');
  } catch (err) {
    console.error('❌ Database connection failed details:');
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code);
    if (err.detail) console.error('Error Detail:', err.detail);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { initializeDatabase };
