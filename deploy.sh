#!/bin/bash

clear

echo "
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   Boss Jobs Ethiopia - Production Deployment                 ║
║   Enterprise Job Portal Platform                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Install from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo "✅ npm $(npm -v)"

# Check PostgreSQL
if pg_isready &> /dev/null; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not running. Starting..."
    sudo systemctl start postgresql 2>/dev/null || sudo service postgresql start 2>/dev/null
    sleep 2
    if pg_isready &> /dev/null; then
        echo "✅ PostgreSQL started"
    else
        echo "❌ Failed to start PostgreSQL"
        exit 1
    fi
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --silent

# Setup database
echo ""
echo "🗄️  Setting up production database..."
node setup-production.js

# Seed initial data
echo ""
echo "🌱 Seeding initial data..."
node setup-clean.js

# Create necessary directories
mkdir -p uploads/{audio,documents,images,temp}
mkdir -p logs
mkdir -p public

# Free port
echo ""
echo "🔍 Checking port 3000..."
sudo fuser -k 3000/tcp 2>/dev/null && echo "   Freed port 3000" || echo "   Port 3000 is free"

# Start server
echo ""
echo "🚀 Starting Boss Jobs Ethiopia API..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev

