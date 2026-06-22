const fs = require('fs');
const path = require('path');

async function initializeDatabase(pool) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const patchPath = path.join(__dirname, 'patch_role_column.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const patch = fs.readFileSync(patchPath, 'utf8');

  const host = pool.options.host;
  const database = pool.options.database;

  console.log(`🔄 [DB Handshake] Attempting direct connection to ${host}/${database}...`);

  try {
    const client = await pool.connect();
    console.log(`🔗 [Success] Database reached successfully via: ${host}`);

    try {
      console.log('🔄 Running core schema synchronization...');
      await client.query(schema);

      console.log('🔄 Applying schema patches...');
      await client.query(patch);

      const categoriesTable = fs.readFileSync(path.join(__dirname, 'patch_categories.sql'), 'utf8');
      await client.query(categoriesTable);

      const bookingsTable = fs.readFileSync(path.join(__dirname, 'patch_bookings.sql'), 'utf8');
      await client.query(bookingsTable);

      const categoriesSeed = fs.readFileSync(path.join(__dirname, 'seed_categories.sql'), 'utf8');
      await client.query(categoriesSeed);

      const adminSeed = fs.readFileSync(path.join(__dirname, "init_admin.sql"), "utf8");
      await client.query(adminSeed);

      const statsSeed = fs.readFileSync(path.join(__dirname, "seed_stats.sql"), "utf8");
      await client.query(statsSeed);

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
