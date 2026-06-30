#!/bin/bash

echo "🚀 Initializing Boss Jobs Ethiopia Backend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create upload directories
echo "📁 Creating upload directories..."
mkdir -p uploads/{audio,documents,temp}

# Check if .env exists, if not copy from example
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "⚠️ Please update .env with your configuration!"
fi

echo "✅ Initialization complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your database credentials and secrets"
echo "2. Run 'npm run dev' to start development server"
echo "3. Visit http://localhost:3000/health to verify the server is running"
