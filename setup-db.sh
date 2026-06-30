#!/bin/bash

echo "🗄️  PostgreSQL Database Setup for Boss Jobs Ethiopia"
echo "=================================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo ""
    echo "Install PostgreSQL:"
    echo "  sudo apt update"
    echo "  sudo apt install postgresql postgresql-contrib"
    echo ""
    echo "Or visit: https://www.postgresql.org/download/linux/ubuntu/"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo "⚠️  PostgreSQL is not running. Attempting to start..."
    sudo systemctl start postgresql || sudo service postgresql start
    sleep 2
fi

# Get the current username
CURRENT_USER=$(whoami)
echo "Current user: $CURRENT_USER"
echo ""

# Ask for database configuration
read -p "Database name [boss_jobs_ethiopia]: " DB_NAME
DB_NAME=${DB_NAME:-boss_jobs_ethiopia}

read -p "Database user [$CURRENT_USER]: " DB_USER
DB_USER=${DB_USER:-$CURRENT_USER}

read -sp "Database password [leave empty for no password]: " DB_PASSWORD
echo ""

echo ""
echo "📋 Configuration:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: ${DB_PASSWORD:+[set]}"
echo ""

# Create database and user
echo "🔄 Setting up PostgreSQL..."

if [ -n "$DB_PASSWORD" ]; then
    # With password
    sudo -u postgres psql <<EOF
-- Create user if not exists
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';
  ELSE
    ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
  END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
