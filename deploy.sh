#!/bin/bash

echo "🏌️ Golf Tracker - NAS Deployment Script"
echo "========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo ""
    echo "📝 Please edit .env file with your configuration:"
    echo "   - APP_PASSWORD: Your secure password"
    echo "   - SESSION_SECRET: Random secret string"
    echo "   - TRAEFIK_HOST: Your domain (e.g., golf.yourdomain.com)"
    echo ""
    echo "Run this script again after configuring .env"
    exit 1
fi

# Load environment variables
source .env

echo "Configuration:"
echo "  - Traefik Host: ${TRAEFIK_HOST:-golf.local}"
echo "  - Password: ${APP_PASSWORD:0:4}**** (hidden)"
echo ""

# Check if traefik network exists
if ! docker network ls | grep -q "traefik"; then
    echo "⚠️  Warning: 'traefik' network not found."
    echo "   Make sure Traefik is running or update docker-compose.yml"
    echo ""
fi

# Build and deploy
echo "🔨 Building Docker image..."
docker-compose build

echo ""
echo "🚀 Starting container..."
docker-compose up -d

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Access your app at:"
echo "  - Traefik: https://${TRAEFIK_HOST:-golf.local}"
echo "  - Direct: http://localhost:3001"
echo ""
echo "View logs with: docker-compose logs -f"
echo "Stop with: docker-compose down"
