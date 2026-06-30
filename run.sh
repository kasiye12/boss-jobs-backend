#!/bin/bash

echo "========================================="
echo "  Boss Jobs Ethiopia - Quick Start"
echo "========================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "Creating default .env for development..."
    cat > .env << 'ENV'
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boss_jobs_ethiopia
DB_USER=boss_jobs_user
DB_PASSWORD=boss_jobs_2024
JWT_SECRET=boss_jobs_dev_secret_2024
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=boss_jobs_refresh_secret_2024
JWT_REFRESH_EXPIRES_IN=30d
MAX_AUDIO_SIZE_MB=5
MAX_PROFILE_IMAGE_SIZE_MB=2
DEFAULT_SEARCH_RADIUS_KM=10
APP_URL=http://localhost:3000
API_URL=http://localhost:3000
ALLOWED_ORIGINS=*
ENV
    echo "✅ Created .env file"
    echo ""
fi

# Kill existing processes on port 3000
echo "🔍 Checking port 3000..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 is in use. Killing existing process..."
    sudo fuser -k 3000/tcp 2>/dev/null || true
    sleep 2
fi

# Run database setup if needed
echo ""
echo "🗄️  Setting up database..."
node setup-clean.js 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Database setup encountered issues, but continuing..."
fi

echo ""
echo "🚀 Starting server..."
echo ""
npm run dev

