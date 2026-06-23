const { Pool } = require('pg');
const { parse } = require('pg-connection-string');

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wantok';
const config = parse(dbUrl);
const pool = new Pool(config);

async function check() {
  try {
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', tables.rows.map(r => r.table_name));

    const auditCount = await pool.query("SELECT COUNT(*) FROM audit_logs").catch(() => ({rows: [{count: 'N/A'}]}));
    console.log('Audit logs count:', auditCount.rows[0].count);

    const userCount = await pool.query("SELECT COUNT(*) FROM users").catch(() => ({rows: [{count: 'N/A'}]}));
    console.log('Users count:', userCount.rows[0].count);
  } catch (e) {
    console.error('DB Check Error:', e.message);
  } finally {
    await pool.end();
  }
}

check();
