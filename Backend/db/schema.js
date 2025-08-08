// db/schema.js
const pool = require('./index');

async function initializeDb() {
    try {
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
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);
        await pool.query(`
    CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
`);
        await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        school_id VARCHAR(255) REFERENCES schools(id),
        grade VARCHAR(50),
        age INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
`);
        await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
`);

        console.log("✅ Tables initialized.");
    } catch (err) {
        console.error('Error initializing database schema:', err.stack);
    }
}

module.exports = initializeDb;
