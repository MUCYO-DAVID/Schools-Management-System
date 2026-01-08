// db/seed.js
const pool = require('./index');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

async function seedSchools() {
  await pool.query(`
    INSERT INTO schools (id, name, name_rw, location, type, level, students, established)
    VALUES 
      ('${uuidv4()}', 'St. Mary High', 'St. Mary', 'Kigali', 'Private', 'Secondary', 450, 1998),
      ('${uuidv4()}', 'Green Hills', 'Green Hills', 'Musanze', 'Public', 'Primary', 320, 2005)
    ON CONFLICT (id) DO NOTHING;
  `);

  console.log("🌱 Schools seeded.");
}

async function seedAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR role = $2',
      ['admin@rsb.com', 'admin']
    );

    if (existingAdmin.rows.length > 0) {
      console.log("👤 Admin user already exists.");
      return;
    }

    // Create default admin user
    const adminPassword = 'admin123'; // Default password - CHANGE THIS IN PRODUCTION!
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO NOTHING`,
      ['Admin', 'User', 'admin@rsb.com', hashedPassword, 'admin']
    );

    console.log("👤 Admin user seeded successfully!");
    console.log("📧 Email: admin@rsb.com");
    console.log("🔑 Password: admin123");
    console.log("⚠️  IMPORTANT: Change the admin password after first login!");
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  }
}

async function seedAll() {
  await seedSchools();
  await seedAdminUser();
}

module.exports = { seedSchools, seedAdminUser, seedAll };
