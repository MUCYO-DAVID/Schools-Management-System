// db/seed.js
const pool = require('./index');

async function seedSchools() {
  await pool.query(`
    INSERT INTO schools (id, name, name_rw, location, type, level, students, established)
    VALUES 
      ('sch_001', 'St. Mary High', 'St. Mary', 'Kigali', 'Private', 'Secondary', 450, 1998),
      ('sch_002', 'Green Hills', 'Green Hills', 'Musanze', 'Public', 'Primary', 320, 2005)
    ON CONFLICT (id) DO NOTHING;
  `);

  console.log("🌱 Schools seeded.");
}

module.exports = seedSchools;
