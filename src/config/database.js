const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'boss_jobs_ethiopia',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? false : false,
    pool: {
      max: parseInt(process.env.DB_MAX_POOL) || 20,
      min: parseInt(process.env.DB_MIN_POOL) || 2,
      acquire: 30000,
      idle: parseInt(process.env.DB_IDLE_TIMEOUT) || 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false,
    },
    retry: {
      max: 3,
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
    },
  }
);

// Test database connection with retry
const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully.');
      
      // Enable required PostgreSQL extensions
      try {
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS cube;');
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS earthdistance;');
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        console.log('✅ PostgreSQL extensions enabled successfully.');
      } catch (extError) {
        console.warn('⚠️  Could not enable PostgreSQL extensions:', extError.message);
        console.warn('   Some features may not work (geospatial queries, etc.)');
        console.warn('   You may need superuser privileges to enable extensions.');
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Connection attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        console.error('\n💡 Troubleshooting tips:');
        console.error('1. Make sure PostgreSQL is running:');
        console.error('   sudo systemctl start postgresql');
        console.error('   or: sudo service postgresql start');
        console.error('');
        console.error('2. Check your .env file has correct credentials');
        console.error(`   Current user: ${process.env.DB_USER || 'postgres'}`);
        console.error(`   Database: ${process.env.DB_NAME || 'boss_jobs_ethiopia'}`);
        console.error('');
        console.error('3. Create the database if it doesn\'t exist:');
        console.error(`   sudo -u postgres createdb ${process.env.DB_NAME || 'boss_jobs_ethiopia'}`);
        console.error('');
        console.error('4. Set password for your user:');
        console.error(`   sudo -u postgres psql -c "ALTER USER ${process.env.DB_USER || 'postgres'} PASSWORD 'your_password';"`);
        console.error('');
        console.error('5. Or update pg_hba.conf to allow trust authentication for local connections');
        console.error('   sudo nano /etc/postgresql/*/main/pg_hba.conf');
        console.error('   Change "md5" to "trust" for local connections');
        
        throw error;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

module.exports = { sequelize, testConnection };
