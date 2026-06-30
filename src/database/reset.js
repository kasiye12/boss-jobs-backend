const { sequelize, syncDatabase } = require('../models/index');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function resetDatabase() {
  console.log('⚠️  WARNING: This will delete ALL data in the database!');
  console.log('Database:', process.env.DB_NAME);
  console.log('');
  
  rl.question('Are you sure you want to continue? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() === 'yes') {
      try {
        console.log('🔄 Resetting database...');
        await syncDatabase(true);
        console.log('✅ Database reset completed!');
        console.log('   All tables dropped and recreated.');
        console.log('   You can now run: npm run db:seed');
      } catch (error) {
        console.error('❌ Reset failed:', error.message);
      }
    } else {
      console.log('❌ Reset cancelled.');
    }
    rl.close();
    process.exit(0);
  });
}

resetDatabase();
