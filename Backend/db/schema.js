// db/schema.js
const pool = require('./index');

async function initializeDb() {
  try {
    // Schools
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_rw VARCHAR(255),
        location VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        level VARCHAR(50) NOT NULL,
        students INTEGER DEFAULT 0,
        established INTEGER,
        image_urls TEXT,
        rating_total INTEGER DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Surveys
    await pool.query(`
      CREATE TABLE IF NOT EXISTS surveys (
        id SERIAL PRIMARY KEY,
        school_id VARCHAR(255) REFERENCES schools(id) ON DELETE SET NULL,
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        would_recommend BOOLEAN,
        comments TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // FAQs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Contacts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Students
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        school_id VARCHAR(255) REFERENCES schools(id) ON DELETE SET NULL,
        grade VARCHAR(50),
        age INTEGER,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Verification Codes - Drop and recreate to ensure correct structure
    try {
      await pool.query('DROP TABLE IF EXISTS verification_codes CASCADE;');
    } catch (dropError) {
      // If we can't drop it (permission issue), try to continue
      console.warn('⚠️  Could not drop verification_codes table (non-critical):', dropError.message);
    }

    // Create the table with correct structure
    await pool.query(`
      CREATE TABLE verification_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index on email for faster lookups (if we have permission)
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
      `);
    } catch (indexError) {
      // Index creation failed (likely permission issue), but table exists so we can continue
      console.warn('⚠️  Could not create index on verification_codes (this is non-critical):', indexError.message);
    }

    console.log('Tables initialized.');
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
    throw error;
  }
}

module.exports = initializeDb;
