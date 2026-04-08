// db/schema.js
const pool = require('./index');

async function initializeDb() {
  try {
    const shouldResetSchema = process.env.RESET_SCHEMA === 'true';

    // Users (create first to satisfy foreign key references)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        phone VARCHAR(50),
        avatar_url TEXT,
        bio TEXT,
        location VARCHAR(255),
        date_of_birth DATE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add profile columns if they don't exist
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
        ADD COLUMN IF NOT EXISTS avatar_url TEXT,
        ADD COLUMN IF NOT EXISTS bio TEXT,
        ADD COLUMN IF NOT EXISTS location VARCHAR(255),
        ADD COLUMN IF NOT EXISTS date_of_birth DATE;
      `);
    } catch (alterError) {
      console.warn('⚠️  Could not add profile columns to users (may already exist):', alterError.message);
    }

    // Create user preferences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        email_notifications BOOLEAN DEFAULT true,
        push_notifications BOOLEAN DEFAULT false,
        email_grades BOOLEAN DEFAULT true,
        email_applications BOOLEAN DEFAULT true,
        email_events BOOLEAN DEFAULT true,
        language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

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
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add created_by column if it doesn't exist (for existing databases)
    try {
      await pool.query(`
        ALTER TABLE schools 
        ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
      `);
    } catch (alterError) {
      console.warn('⚠️  Could not add created_by column to schools (may already exist):', alterError.message);
    }

    // Add latitude and longitude columns for map functionality
    try {
      await pool.query(`
        ALTER TABLE schools 
        ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
        ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
      `);
    } catch (alterError) {
      console.warn('⚠️  Could not add latitude/longitude columns to schools (may already exist):', alterError.message);
    }

    // Create index for geospatial queries
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_schools_coordinates ON schools(latitude, longitude);
      `);
    } catch (indexError) {
      console.warn('⚠️  Could not create index on coordinates (non-critical):', indexError.message);
    }

    // Check the actual type of schools.id to use for all foreign key references
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

    // School Details - Additional information managed by headmasters
    if (shouldResetSchema) {
      try {
        await pool.query('DROP TABLE IF EXISTS school_details CASCADE;');
      } catch (dropError) {
        console.warn('⚠️  Could not drop school_details table (non-critical):', dropError.message);
      }
    }

    // Build the CREATE TABLE query with the correct type (using schoolIdType declared earlier)
    const createSchoolDetailsSql = `
      CREATE TABLE IF NOT EXISTS school_details (
        id SERIAL PRIMARY KEY,
        school_id ` + schoolIdType + ` REFERENCES schools(id) ON DELETE CASCADE,
        description TEXT,
        facilities TEXT,
        programs TEXT,
        admission_requirements TEXT,
        fees_info TEXT,
        uniform_info TEXT,
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

    // Add uniform_info column if it doesn't exist (for existing databases)
    try {
      await pool.query(`
        ALTER TABLE school_details 
        ADD COLUMN IF NOT EXISTS uniform_info TEXT;
      `);
    } catch (alterError) {
      console.warn('⚠️  Could not add uniform_info column to school_details (may already exist):', alterError.message);
    }

    // Create index for school_details
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_school_details_school_id ON school_details(school_id);
      `);
    } catch (indexError) {
      console.warn('⚠️  Could not create index on school_details (non-critical):', indexError.message);
    }

    // Surveys
    const createSurveysSql = `
      CREATE TABLE IF NOT EXISTS surveys (
        id SERIAL PRIMARY KEY,
        school_id ` + schoolIdType + ` REFERENCES schools(id) ON DELETE SET NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        would_recommend BOOLEAN,
        comments TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createSurveysSql);

    // Add user_id column if it doesn't exist (for existing databases)
    try {
      await pool.query(`
        ALTER TABLE surveys 
        ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
      `);
    } catch (alterError) {
      console.warn('⚠️  Could not add user_id column to surveys (may already exist):', alterError.message);
    }

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

    // Survey Templates - Surveys with questions (for admin/leader created surveys)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS survey_templates (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        school_id ` + schoolIdType + ` REFERENCES schools(id) ON DELETE CASCADE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        audience_role VARCHAR(50) DEFAULT 'all',
        status VARCHAR(50) DEFAULT 'draft',
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Survey Questions - Questions for survey templates
    await pool.query(`
      CREATE TABLE IF NOT EXISTS survey_questions (
        id SERIAL PRIMARY KEY,
        survey_template_id INTEGER REFERENCES survey_templates(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) NOT NULL DEFAULT 'text',
        options TEXT,
        is_required BOOLEAN DEFAULT false,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Survey Responses - User responses to survey templates
    await pool.query(`
      CREATE TABLE IF NOT EXISTS survey_responses (
        id SERIAL PRIMARY KEY,
        survey_template_id INTEGER REFERENCES survey_templates(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(survey_template_id, user_id)
      );
    `);

    // Survey Answer - Individual answers to questions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS survey_answers (
        id SERIAL PRIMARY KEY,
        survey_response_id INTEGER REFERENCES survey_responses(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES survey_questions(id) ON DELETE CASCADE,
        answer_text TEXT,
        answer_value TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for survey system
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_survey_templates_school ON survey_templates(school_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_survey_templates_created_by ON survey_templates(created_by);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_survey_questions_template ON survey_questions(survey_template_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_survey_responses_template ON survey_responses(survey_template_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_survey_responses_user ON survey_responses(user_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_survey_answers_response ON survey_answers(survey_response_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_survey_answers_question ON survey_answers(question_id);`);
    } catch (indexError) {
      console.warn('⚠️  Could not create indexes on survey tables (non-critical):', indexError.message);
    }

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

    // Announcements (for parent/teacher/student portals)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        audience_role VARCHAR(50) DEFAULT 'all',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Messages between users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        recipient_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        subject VARCHAR(255),
        body TEXT NOT NULL,
        read_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Shared documents for portals
    await pool.query(`
      CREATE TABLE IF NOT EXISTS portal_documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        audience_role VARCHAR(50) DEFAULT 'all',
        uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Fee schedules
    if (shouldResetSchema) {
      try {
        await pool.query('DROP TABLE IF EXISTS fee_schedules CASCADE;');
      } catch (dropError) {
        console.warn('⚠️  Could not drop fee_schedules table (non-critical):', dropError.message);
      }
    }

    const createFeeSchedulesSql = `
      CREATE TABLE IF NOT EXISTS fee_schedules (
        id SERIAL PRIMARY KEY,
        school_id ` + schoolIdType + ` REFERENCES schools(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'RWF',
        due_date DATE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createFeeSchedulesSql);

    // Fee invoices
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fee_invoices (
        id SERIAL PRIMARY KEY,
        schedule_id INTEGER REFERENCES fee_schedules(id) ON DELETE SET NULL,
        student_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        amount NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'RWF',
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Payment transactions (sandbox)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER REFERENCES fee_invoices(id) ON DELETE SET NULL,
        amount NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'RWF',
        provider VARCHAR(50) DEFAULT 'sandbox',
        status VARCHAR(50) DEFAULT 'success',
        reference VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Indexes for new tables
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_announcements_audience_role ON announcements(audience_role);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_portal_documents_audience_role ON portal_documents(audience_role);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_fee_invoices_student_user_id ON fee_invoices(student_user_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_fee_invoices_status ON fee_invoices(status);`);
    } catch (indexError) {
      console.warn('⚠️  Could not create indexes on portal/payment tables (non-critical):', indexError.message);
    }

    // Students
    const createStudentsSql = `
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        school_id ` + schoolIdType + ` REFERENCES schools(id) ON DELETE SET NULL,
        grade VARCHAR(50),
        age INTEGER,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createStudentsSql);

    // Student Applications - Allow students to apply to schools
    if (shouldResetSchema) {
      try {
        await pool.query('DROP TABLE IF EXISTS student_applications CASCADE;');
      } catch (dropError) {
        console.warn('⚠️  Could not drop student_applications table (non-critical):', dropError.message);
      }
    }

    // Build the CREATE TABLE query with the correct type (using schoolIdType declared earlier)
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS student_applications (
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
        document_urls TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        rejection_reason TEXT,
        reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, school_id)
      );
    `;

    await pool.query(createTableSql);

    // Add new columns to existing student_applications table if they don't exist
    try {
      await pool.query(`
        ALTER TABLE student_applications 
        ADD COLUMN IF NOT EXISTS document_urls TEXT,
        ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
        ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
      `);
    } catch (alterError) {
      console.warn('⚠️  Could not add new columns to student_applications (may already exist):', alterError.message);
    }

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
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_student_applications_reviewed_by ON student_applications(reviewed_by);
      `);
    } catch (indexError) {
      console.warn('⚠️  Could not create indexes on student_applications (non-critical):', indexError.message);
    }

    // Verification Codes - Drop and recreate to ensure correct structure (only if resetting)
    if (shouldResetSchema) {
      try {
        await pool.query('DROP TABLE IF EXISTS verification_codes CASCADE;');
      } catch (dropError) {
        // If we can't drop it (permission issue), try to continue
        console.warn('⚠️  Could not drop verification_codes table (non-critical):', dropError.message);
      }
    }

    // Create the table with correct structure
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verification_codes (
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

    // Teacher Information - Additional details for teachers
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teacher_info (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        school_name VARCHAR(255),
        subject VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index on teacher_info
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_teacher_info_user_id ON teacher_info(user_id);
      `);
    } catch (indexError) {
      console.warn('⚠️  Could not create index on teacher_info (non-critical):', indexError.message);
    }

    // Notifications - System notifications for users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        read BOOLEAN DEFAULT false,
        link VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for notifications
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
      `);
    } catch (indexError) {
      console.warn('⚠️  Could not create indexes on notifications (non-critical):', indexError.message);
    }

    // ==================== NEW FEATURES ====================

    // Grades - Student grade management
    const createGradesSql = `
      CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        student_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        school_id ` + schoolIdType + ` REFERENCES schools(id) ON DELETE CASCADE,
        subject VARCHAR(255) NOT NULL,
        grade VARCHAR(10) NOT NULL,
        score DECIMAL(5, 2),
        max_score DECIMAL(5, 2) DEFAULT 100,
        term VARCHAR(50),
        academic_year VARCHAR(20),
        teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        comments TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createGradesSql);

    // Report Cards - Generated report summaries
    const createReportCardsSql = `
      CREATE TABLE IF NOT EXISTS report_cards (
        id SERIAL PRIMARY KEY,
        student_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        school_id ` + schoolIdType + ` REFERENCES schools(id) ON DELETE CASCADE,
        term VARCHAR(50) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        overall_grade VARCHAR(10),
        overall_percentage DECIMAL(5, 2),
        attendance_percentage DECIMAL(5, 2),
        teacher_comments TEXT,
        principal_comments TEXT,
        generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_user_id, school_id, term, academic_year)
      );
    `;
    await pool.query(createReportCardsSql);

    // Events - School calendar events
    const createEventsSql = `
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        school_id ` + schoolIdType + ` REFERENCES schools(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_type VARCHAR(50) DEFAULT 'general',
        start_date TIMESTAMPTZ NOT NULL,
        end_date TIMESTAMPTZ,
        location VARCHAR(255),
        audience_role VARCHAR(50) DEFAULT 'all',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        reminder_enabled BOOLEAN DEFAULT false,
        reminder_minutes INTEGER DEFAULT 60,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createEventsSql);

    // Event RSVPs - Track who's attending
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_rsvps (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'attending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      );
    `);

    // Galleries - Photo/Video collections for schools
    const createGalleriesSql = `
      CREATE TABLE IF NOT EXISTS galleries (
        id SERIAL PRIMARY KEY,
        school_id ` + schoolIdType + ` REFERENCES schools(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        gallery_type VARCHAR(50) DEFAULT 'photos',
        is_featured BOOLEAN DEFAULT false,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createGalleriesSql);

    // Gallery Items - Individual photos/videos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id SERIAL PRIMARY KEY,
        gallery_id INTEGER REFERENCES galleries(id) ON DELETE CASCADE,
        media_type VARCHAR(20) DEFAULT 'photo',
        media_url TEXT NOT NULL,
        thumbnail_url TEXT,
        title VARCHAR(255),
        description TEXT,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Chat Rooms - Manage chat conversations
    const createChatRoomsSql = `
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id SERIAL PRIMARY KEY,
        room_type VARCHAR(50) DEFAULT 'direct',
        school_id ` + schoolIdType + ` REFERENCES schools(id) ON DELETE CASCADE,
        name VARCHAR(255),
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createChatRoomsSql);

    // Chat Room Members - Track participants
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_room_members (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        last_read_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(room_id, user_id)
      );
    `);

    // Chat Messages - Real-time messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text',
        attachment_url TEXT,
        read_by TEXT DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Scholarships - Scholarship opportunities
    const createScholarshipsSql = `
      CREATE TABLE IF NOT EXISTS scholarships (
        id SERIAL PRIMARY KEY,
        school_id ` + schoolIdType + ` REFERENCES schools(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        amount NUMERIC(12, 2),
        currency VARCHAR(10) DEFAULT 'RWF',
        coverage_type VARCHAR(100),
        eligibility_criteria TEXT,
        required_documents TEXT,
        application_deadline DATE,
        start_date DATE,
        end_date DATE,
        total_slots INTEGER,
        remaining_slots INTEGER,
        status VARCHAR(50) DEFAULT 'active',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createScholarshipsSql);

    // Scholarship Applications - Student scholarship applications
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scholarship_applications (
        id SERIAL PRIMARY KEY,
        scholarship_id INTEGER REFERENCES scholarships(id) ON DELETE CASCADE,
        student_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        application_essay TEXT,
        supporting_documents TEXT,
        academic_records TEXT,
        financial_need_statement TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        review_score DECIMAL(5, 2),
        reviewer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        reviewer_comments TEXT,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(scholarship_id, student_user_id)
      );
    `);

    // Parent-Child Relationships - Link parents to their children (students)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS parent_child_relationships (
        id SERIAL PRIMARY KEY,
        parent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        child_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        relationship_type VARCHAR(50) DEFAULT 'parent',
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(parent_id, child_id)
      );
    `);

    // Create indexes for parent-child relationships
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_parent_child_parent ON parent_child_relationships(parent_id);
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_parent_child_child ON parent_child_relationships(child_id);
      `);
    } catch (indexError) {
      console.warn('⚠️  Could not create parent-child indexes (non-critical):', indexError.message);
    }

    // Create indexes for new tables
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_user_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_grades_school ON grades(school_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_grades_teacher ON grades(teacher_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_report_cards_student ON report_cards(student_user_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_events_school ON events(school_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_events_date ON events(start_date);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_galleries_school ON galleries(school_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_gallery_items_gallery ON gallery_items(gallery_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_rooms_school ON chat_rooms(school_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_scholarships_school ON scholarships(school_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_scholarships_status ON scholarships(status);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_scholarship_apps_scholarship ON scholarship_applications(scholarship_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_scholarship_apps_student ON scholarship_applications(student_user_id);`);
    } catch (indexError) {
      console.warn('⚠️  Could not create indexes for new features (non-critical):', indexError.message);
    }

    // User Connections (Friend Requests)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_connections (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(sender_id, receiver_id)
      );
    `);

    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_connections_sender ON user_connections(sender_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_connections_receiver ON user_connections(receiver_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);`);
    } catch (indexError) {
      console.warn('⚠️  Could not create user_connections indexes (non-critical):', indexError.message);
    }

    console.log('✅ All tables initialized (including new features: Grades, Events, Galleries, Chat, Scholarships, Connections).');

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
