// scripts/createAdmin.js
// Run this script to create a default admin user
// Usage: node scripts/createAdmin.js

require('dotenv').config();
const pool = require('../db');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    console.log(' Creating admin user...');

    // Check if admin user already exists
    const existingAdmin = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@rsb.com']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin user already exists with email: admin@rsb.com');
      console.log('📧 Email: admin@rsb.com');
      console.log('💡 If you forgot the password, you can update it in the database or delete and recreate this user.');
      process.exit(0);
    }

    // Create default admin user
    const adminPassword = 'admin123'; // Default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, first_name, last_name, email, role`,
      ['Admin', 'User', 'admin@rsb.com', hashedPassword, 'admin']
    );

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@rsb.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role:     admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('⚠️  This is a default password for development only!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Run the function
createAdminUser();
