const fs = require("fs");
const path = require("path");

async function initializeDatabase(pool) {
  const host = pool.options.host;
  const database = pool.options.database;

  console.log(`🔄 [DB Handshake] Attempting direct connection to ${host}/${database}...`);

  try {
    const client = await pool.connect();
    console.log(`🔗 [Success] Database reached successfully via: ${host}`);

    try {
      // 1. Core Schema Synchronization (MUST RUN FIRST)
      console.log("🔄 Running core schema synchronization...");
      const schemaPath = path.join(__dirname, "schema.sql");
      const schema = fs.readFileSync(schemaPath, "utf8");
      await client.query(schema);

      // 2. Schema Patches and Seeds (Non-critical, wrapped in try/catch)
      const runPatch = async (fileName, description) => {
        try {
          console.log(`🔄 Applying ${description} (${fileName})...`);
          const filePath = path.join(__dirname, fileName);
          if (fs.existsSync(filePath)) {
            const sql = fs.readFileSync(filePath, "utf8");
            await client.query(sql);
          }
        } catch (err) {
          console.error(`⚠️ Non-critical schema patch skipped (${fileName}):`, err.message);
        }
      };

      await runPatch("patch_role_column.sql", "role column patch");
      await runPatch("patch_categories.sql", "categories table patch");
      await runPatch("patch_bookings.sql", "bookings table patch");
      await runPatch("patch_admin_master.sql", "admin master patch");
      await runPatch("patch_system_settings.sql", "system settings patch");
      await runPatch("seed_categories.sql", "categories seed");
      await runPatch("init_admin.sql", "admin user seed");
      await runPatch("seed_stats.sql", "system stats seed");

      console.log("✅ [Ready] Database initialization complete.");
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("❌ [Critical] Database connection failed.");
    console.error(`Target Host: ${host}`);
    console.error(`Target Database: ${database}`);
    console.error("Error Message:", err.message);
    console.error("Error Code:", err.code);
    throw err;
  }
}

module.exports = { initializeDatabase };
