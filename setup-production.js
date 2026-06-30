const { sequelize } = require('./src/config/database');

async function setupProductionDatabase() {
  console.log('🏗️  Setting up Boss Jobs Ethiopia production database...\n');

  try {
    // Create all tables
    const tables = [
      // Core tables
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'job_seeker',
        telegram_id VARCHAR(50) UNIQUE,
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        phone_verified BOOLEAN DEFAULT false,
        two_factor_enabled BOOLEAN DEFAULT false,
        two_factor_secret VARCHAR(100),
        last_login_at TIMESTAMP,
        profile_completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS job_seeker_profiles (
        id SERIAL PRIMARY KEY,
        user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(100),
        bio TEXT,
        voice_pitch_url VARCHAR(255),
        skills TEXT[],
        experience_json JSONB DEFAULT '[]',
        education_json JSONB DEFAULT '[]',
        latitude DECIMAL(9,6),
        longitude DECIMAL(9,6),
        preferred_job_types TEXT[],
        expected_salary_range VARCHAR(50),
        availability_status VARCHAR(20) DEFAULT 'immediate',
        profile_picture_url VARCHAR(255),
        resume_url VARCHAR(255),
        years_of_experience INT,
        is_profile_complete BOOLEAN DEFAULT false,
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) UNIQUE NOT NULL,
        logo VARCHAR(255),
        cover_image VARCHAR(255),
        description TEXT,
        website VARCHAR(255),
        industry VARCHAR(100),
        company_size VARCHAR(50),
        founded_year INT,
        headquarters VARCHAR(200),
        locations JSONB DEFAULT '[]',
        social_links JSONB DEFAULT '{}',
        benefits TEXT[],
        average_rating DECIMAL(2,1) DEFAULT 0,
        review_count INT DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        employer_id INT REFERENCES users(id) ON DELETE CASCADE,
        category_id INT,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        company_name VARCHAR(100) NOT NULL,
        job_type VARCHAR(50) DEFAULT 'Full-time',
        salary_range VARCHAR(50),
        salary_min DECIMAL(10,2),
        salary_max DECIMAL(10,2),
        latitude DECIMAL(9,6),
        longitude DECIMAL(9,6),
        city VARCHAR(100),
        assessment_questions JSONB DEFAULT '[]',
        required_skills TEXT[],
        preferred_skills TEXT[],
        required_experience INT,
        education_level VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        is_remote BOOLEAN DEFAULT false,
        application_deadline TIMESTAMP,
        vacancies_count INT DEFAULT 1,
        views_count INT DEFAULT 0,
        applications_count INT DEFAULT 0,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
        seeker_id INT REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        quiz_score INT DEFAULT 0,
        quiz_answers JSONB DEFAULT '[]',
        cover_letter TEXT,
        employer_notes TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, seeker_id)
      )`,

      `CREATE TABLE IF NOT EXISTS saved_jobs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
        notes TEXT,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, job_id)
      )`,

      `CREATE TABLE IF NOT EXISTS company_reviews (
        id SERIAL PRIMARY KEY,
        company_id INT REFERENCES companies(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(200),
        review TEXT,
        pros TEXT,
        cons TEXT,
        position VARCHAR(100),
        employment_status VARCHAR(50),
        is_anonymous BOOLEAN DEFAULT false,
        is_approved BOOLEAN DEFAULT true,
        helpful_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, company_id)
      )`,

      `CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        participant_1_id INT REFERENCES users(id) ON DELETE CASCADE,
        participant_2_id INT REFERENCES users(id) ON DELETE CASCADE,
        last_message TEXT,
        last_message_at TIMESTAMP,
        unread_count_1 INT DEFAULT 0,
        unread_count_2 INT DEFAULT 0,
        job_id INT REFERENCES jobs(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(participant_1_id, participant_2_id)
      )`,

      `CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INT REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text',
        attachment_url VARCHAR(255),
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_revoked BOOLEAN DEFAULT false,
        device_info VARCHAR(255),
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS job_alerts (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        keywords TEXT[],
        job_types TEXT[],
        locations TEXT[],
        salary_min DECIMAL(10,2),
        frequency VARCHAR(20) DEFAULT 'daily',
        is_active BOOLEAN DEFAULT true,
        last_sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS job_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        parent_id INT,
        is_active BOOLEAN DEFAULT true,
        job_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    for (const query of tables) {
      await sequelize.query(query);
    }

    // Create indexes
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs USING gist (point(latitude, longitude))`,
      `CREATE INDEX IF NOT EXISTS idx_jobs_skills ON jobs USING gin (required_skills)`,
      `CREATE INDEX IF NOT EXISTS idx_seeker_skills ON job_seeker_profiles USING gin (skills)`,
      `CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id, status)`,
      `CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id, is_active)`,
      `CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category_id, is_active)`,
    ];

    for (const query of indexes) {
      await sequelize.query(query);
    }

    console.log('✅ All tables and indexes created successfully!\n');
    console.log('📊 Tables created:');
    const tableList = [
      'users', 'job_seeker_profiles', 'companies', 'jobs', 
      'applications', 'saved_jobs', 'company_reviews', 
      'conversations', 'messages', 'refresh_tokens', 
      'password_resets', 'job_alerts', 'job_categories'
    ];
    tableList.forEach(t => console.log(`   ✓ ${t}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupProductionDatabase();
