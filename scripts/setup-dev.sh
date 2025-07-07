#!/bin/bash

# Development setup script

set -e

echo "🔧 Setting up development environment..."

# Copy environment variables
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file from .env.example"
    echo "Please update the environment variables in .env file"
fi

# Install dependencies
npm install

# Start MongoDB with Docker
docker-compose up -d mongo

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed the database
npm run db:seed

echo "✅ Development environment setup completed!"
echo "🚀 Run 'npm run dev' to start the development server"
