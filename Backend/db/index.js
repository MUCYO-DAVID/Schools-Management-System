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
// TEMPORARY DEBUGGING - REMOVE AFTER TESTING
console.log('--- ENV VAR DEBUG ---');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 30) + '...');
} else {
  console.log('DATABASE_URL is UNDEFINED!');
}
console.log('----------------------');

// ... (rest of your existing db/index.js code)
module.exports = pool;
