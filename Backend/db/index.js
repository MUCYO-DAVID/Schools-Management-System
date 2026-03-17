// db/index.js
const { Pool } = require('pg');

const rawConnectionString = process.env.DATABASE_URL;
// If `sslmode=require` is present, `pg` may override `rejectUnauthorized: false`.
// We rely on the explicit `ssl` config below instead.
const connectionString = typeof rawConnectionString === 'string'
  ? rawConnectionString.replace(/[?&]sslmode=require\b/, '')
  : rawConnectionString;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
