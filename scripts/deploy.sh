#!/bin/bash

# Deployment script for Payment Dashboard

set -e

echo "🚀 Starting deployment..."

# Pull the latest changes
git pull origin main

# Build and start the containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for the database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations and seeding
docker-compose -f docker-compose.prod.yml exec app npx prisma db push
docker-compose -f docker-compose.prod.yml exec app npm run db:seed

echo "✅ Deployment completed successfully!"

# Show running containers
docker-compose -f docker-compose.prod.yml ps
