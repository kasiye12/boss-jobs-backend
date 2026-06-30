const { sequelize } = require('./src/models/index');

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log(`   Database: ${process.env.DB_NAME || 'boss_jobs_ethiopia'}`);
  console.log(`   User: ${process.env.DB_USER || 'boss_jobs_user'}`);
  
  try {
    await sequelize.authenticate();
    console.log('✅ Connection successful!');
    
    // Test query
    const [result] = await sequelize.query('SELECT current_database(), current_user, version();');
    console.log('📊 Connected to:', result[0].current_database);
    console.log('👤 User:', result[0].current_user);
    console.log('🔧 Version:', result[0].version.split(',')[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
