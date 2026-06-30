const { sequelize, User, JobSeekerProfile, Job, Application } = require('./src/models/index');

async function migrate() {
  try {
    console.log('🔄 Creating database tables...');
    
    // Create tables in correct order
    await User.sync({ force: true });
    console.log('✅ Users table created');
    
    await JobSeekerProfile.sync({ force: true });
    console.log('✅ Job Seeker Profiles table created');
    
    await Job.sync({ force: true });
    console.log('✅ Jobs table created');
    
    await Application.sync({ force: true });
    console.log('✅ Applications table created');
    
    console.log('');
    console.log('🎉 All tables created successfully!');
    
    // Verify tables
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    );
    
    console.log('');
    console.log('📊 Tables in database:');
    tables.forEach(t => console.log('  ✓', t.table_name));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

migrate();
