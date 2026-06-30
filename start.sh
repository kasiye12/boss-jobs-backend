#!/bin/bash

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║          Boss Jobs Ethiopia - Quick Start                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Install from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node -v)"

# Check if PostgreSQL is running
if pg_isready &> /dev/null; then
    echo "✅ PostgreSQL is running"
else
    echo "⚠️  PostgreSQL might not be running"
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
fi

# Setup database if needed
echo ""
echo "🗄️  Checking database..."
PGPASSWORD=boss_jobs_2024 psql -h localhost -U boss_jobs_user -d boss_jobs_ethiopia -c "SELECT COUNT(*) FROM users;" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Database needs setup. Running setup..."
    node setup-clean.js
fi

# Free port
echo ""
echo "🔍 Checking port 3000..."
sudo fuser -k 3000/tcp 2>/dev/null && echo "   Freed port 3000" || echo "   Port 3000 is free"

# Start server
echo ""
echo "🚀 Starting server..."
echo ""
npm run dev

