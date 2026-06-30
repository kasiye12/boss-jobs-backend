const { sequelize } = require('../models/index');

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    console.log('📊 Connecting to database...');
    
    // Sync all models - this creates tables
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database migration completed successfully!');
    console.log('📊 The following tables have been created/updated:');
    console.log('  ✓ users');
    console.log('  ✓ job_seeker_profiles');
    console.log('  ✓ jobs');
    console.log('  ✓ applications');
    console.log('');
    console.log('🚀 You can now seed sample data with: npm run db:seed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

migrate();
