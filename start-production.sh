#!/bin/bash

echo "
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   Boss Jobs Ethiopia - Production Setup                      ║
║   Professional Job Portal for the Ethiopian Market           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"

# Kill existing processes
echo "🔄 Stopping existing processes..."
sudo fuser -k 3000/tcp 2>/dev/null
sleep 2

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Setup database
echo ""
echo "🗄️  Setting up production database..."
node setup-production.js

# Seed data
echo ""
echo "🌱 Seeding initial data..."
node setup-clean.js

# Start server
echo ""
echo "🚀 Starting production server..."
NODE_ENV=production npm run dev

