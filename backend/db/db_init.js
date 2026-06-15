const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
const fs = require('fs');
const path = require('path');

let poolInstance = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // Coolify internal Docker bridges do not use or require SSL
});

async function initializeDatabase() {
  console.log("🔄 Connecting natively using process.env.DATABASE_URL...");
  try {
    let client;
    try {
      client = await poolInstance.connect();
    } catch (err) {
      // Smart Fallback: If DNS resolution fails (ENOTFOUND), try the verified public IP
      if (err.code === 'ENOTFOUND' && process.env.DATABASE_URL) {
        console.warn(`⚠️ DNS Resolution failed for host. Attempting public IP fallback (45.32.243.144)...`);
        const config = parse(process.env.DATABASE_URL);
        config.host = '45.32.243.144';
        config.port = 5432;
        config.ssl = false;

        poolInstance = new Pool(config);
        client = await poolInstance.connect();
      } else {
        throw err;
      }
    }

    console.log("🚀 DATABASE CONNECTION SUCCESSFUL!");

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

module.exports = {
  get pool() { return poolInstance; },
  initializeDatabase
};
