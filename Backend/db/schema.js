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

    // School Details - Additional information managed by headmasters
    // Drop table if exists to handle type changes
    try {
      await pool.query('DROP TABLE IF EXISTS school_details CASCADE;');
    } catch (dropError) {
      console.warn('⚠️  Could not drop school_details table (non-critical):', dropError.message);
    }

    // Check the actual type of schools.id to match it
    let schoolIdTypeForDetails = 'VARCHAR(255)';
    try {
      const typeCheck = await pool.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'schools' AND column_name = 'id'
      `);
      if (typeCheck.rows.length > 0) {
        const actualType = typeCheck.rows[0].data_type;
        if (actualType === 'uuid') {
          schoolIdTypeForDetails = 'UUID';
        }
      }
    } catch (typeError) {
      console.warn('⚠️  Could not check schools.id type for school_details, using VARCHAR(255):', typeError.message);
    }

    // Build the CREATE TABLE query with the correct type
    const createSchoolDetailsSql = `
      CREATE TABLE school_details (
        id SERIAL PRIMARY KEY,
        school_id ` + schoolIdTypeForDetails + ` REFERENCES schools(id) ON DELETE CASCADE,
        description TEXT,
        facilities TEXT,
        programs TEXT,
        admission_requirements TEXT,
        fees_info TEXT,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        website VARCHAR(255),
        address TEXT,
        working_hours VARCHAR(255),
        principal_name VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(school_id)
      );
    `;

    await pool.query(createSchoolDetailsSql);

    // Create index for school_details
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_school_details_school_id ON school_details(school_id);
      `);
    } catch (indexError) {
      console.warn('⚠️  Could not create index on school_details (non-critical):', indexError.message);
    }

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

    // Survey Likes - Track likes on survey comments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS survey_likes (
        id SERIAL PRIMARY KEY,
        survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(survey_id, user_id)
      );
    `);

    // Survey Replies - Track replies to survey comments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS survey_replies (
        id SERIAL PRIMARY KEY,
        survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reply_text TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for faster lookups
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_survey_likes_survey_id ON survey_likes(survey_id);
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_survey_likes_user_id ON survey_likes(user_id);
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_survey_replies_survey_id ON survey_replies(survey_id);
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_survey_replies_user_id ON survey_replies(user_id);
      `);
    } catch (indexError) {
      console.warn('⚠️  Could not create indexes on survey tables (non-critical):', indexError.message);
    }

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

    // Student Applications - Allow students to apply to schools
    // Drop table if exists to handle type changes
    try {
      await pool.query('DROP TABLE IF EXISTS student_applications CASCADE;');
    } catch (dropError) {
      console.warn('⚠️  Could not drop student_applications table (non-critical):', dropError.message);
    }

    // Check the actual type of schools.id to match it
    let schoolIdType = 'VARCHAR(255)';
    try {
      const typeCheck = await pool.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'schools' AND column_name = 'id'
      `);
      if (typeCheck.rows.length > 0) {
        const actualType = typeCheck.rows[0].data_type;
        if (actualType === 'uuid') {
          schoolIdType = 'UUID';
        }
      }
    } catch (typeError) {
      console.warn('⚠️  Could not check schools.id type, using VARCHAR(255):', typeError.message);
    }

    // Build the CREATE TABLE query with the correct type
    const createTableSql = `
      CREATE TABLE student_applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        school_id ` + schoolIdType + ` REFERENCES schools(id) ON DELETE CASCADE,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        date_of_birth DATE,
        current_grade VARCHAR(50),
        desired_grade VARCHAR(50),
        previous_school VARCHAR(255),
        parent_name VARCHAR(255),
        parent_email VARCHAR(255),
        parent_phone VARCHAR(50),
        address TEXT,
        additional_info TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, school_id)
      );
    `;

    await pool.query(createTableSql);

    // Create indexes for student applications
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_student_applications_user_id ON student_applications(user_id);
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_student_applications_school_id ON student_applications(school_id);
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_student_applications_status ON student_applications(status);
      `);
    } catch (indexError) {
      console.warn('⚠️  Could not create indexes on student_applications (non-critical):', indexError.message);
    }

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

    // Optionally create default admin user if it doesn't exist
    // This can be disabled by setting CREATE_DEFAULT_ADMIN=false in .env
    if (process.env.CREATE_DEFAULT_ADMIN !== 'false') {
      try {
        const bcrypt = require('bcryptjs');
        const existingAdmin = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          ['admin@rsb.com']
        );

        if (existingAdmin.rows.length === 0) {
          const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(adminPassword, salt);

          await pool.query(
            `INSERT INTO users (first_name, last_name, email, password, role) 
             VALUES ($1, $2, $3, $4, $5)`,
            ['Admin', 'User', 'admin@rsb.com', hashedPassword, 'admin']
          );

          console.log('👤 Default admin user created: admin@rsb.com');
          console.log(`🔑 Default password: ${adminPassword}`);
          console.log('⚠️  Please change the password after first login!');
        }
      } catch (adminError) {
        // Non-critical - just log and continue
        console.warn('⚠️  Could not create default admin user:', adminError.message);
      }
    }
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
    throw error;
  }
}

module.exports = initializeDb;
