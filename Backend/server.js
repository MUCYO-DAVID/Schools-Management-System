require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000; // Use port 5000 for backend

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// PostgreSQL Connection Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Function to initialize the database schema
const initializeDb = async () => {
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
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

        console.log('Database schema initialized: schools, contacts, students, and users tables ensured.');
    } catch (err) {
        console.error('Error initializing database schema:', err.stack);
    }
};

// Test DB connection and initialize schema
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log('Connected to PostgreSQL at:', result.rows[0].now);
        initializeDb(); // Initialize database schema after successful connection
    });
});

// Basic API Route Example
app.get('/api/schools', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM schools');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});