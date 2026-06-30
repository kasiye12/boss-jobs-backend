const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
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
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Enable required PostgreSQL extensions
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS cube;');
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS earthdistance;');
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    console.log('✅ PostgreSQL extensions enabled successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
