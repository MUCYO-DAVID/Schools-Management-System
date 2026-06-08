/**
 * Creates ad_campaigns table on Supabase/Postgres.
 * Run: node scripts/migrate-ads-table.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL?.replace(/[?&]sslmode=require\b/, '');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const sqlPath = path.join(__dirname, '..', 'db', 'migrations', '001_ad_campaigns.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Applying ad_campaigns migration...');
  await pool.query(sql);
  console.log('✅ ad_campaigns table is ready.');

  const check = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'ad_campaigns' ORDER BY ordinal_position`
  );
  console.log('Columns:', check.rows.map((r) => r.column_name).join(', '));
  await pool.end();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
