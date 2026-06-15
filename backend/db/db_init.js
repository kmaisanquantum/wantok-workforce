const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // Coolify internal Docker bridges do not use or require SSL
});

async function initializeDatabase() {
  console.log("🔄 Connecting natively using process.env.DATABASE_URL...");
  try {
    const client = await pool.connect();
    console.log("🚀 NATIVE DATABASE CONNECTION SUCCESSFUL!");

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 Running schema synchronization...');
    await client.query(schema);
    console.log('✅ [Ready] Database synced.');

    client.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    throw error;
  }
}

module.exports = { pool, initializeDatabase };
