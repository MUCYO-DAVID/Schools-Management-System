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

// Prevent unexpected crashes when Postgres disconnects or DNS fails.
// Without this handler, pg-pool emits an "error" event that can crash Node.
pool.on('error', (err) => {
  console.error('Postgres pool error:', err.message);
});

// ... (rest of your existing db/index.js code)
module.exports = pool;
