#!/bin/bash

# TMD Quasar App Deployment Script
# Usage: ./deploy.sh

set -e

# SSH connection and remote path
SSH_CONNECTION="netcup-webserver-shared"
REMOTE_PATH="/domains/app.tangomarathons.com"

echo "🚀 Building TMD Quasar App..."

# Build the app
pnpm build

echo "✅ Build completed successfully!"

# Check if build was successful
if [ ! -d "dist/spa" ]; then
    echo "❌ Build failed - dist/spa directory not found"
    exit 1
fi

echo "📤 Deploying to $SSH_CONNECTION:$REMOTE_PATH..."

# Create a temporary directory for deployment
TEMP_DIR=$(mktemp -d)
cp -r dist/spa/* "$TEMP_DIR/"

# Deploy using scp (app files)
scp -r "$TEMP_DIR"/* $SSH_CONNECTION:$REMOTE_PATH/

# Also upload production env file as .env
if [ -f "docs/env.prod" ]; then
  scp docs/env.prod $SSH_CONNECTION:$REMOTE_PATH/.env
fi

# Clean up temporary directory
rm -rf "$TEMP_DIR"

echo "✅ Deployment completed successfully!"
echo "🌐 Your app should now be available at: https://app.tangomarathons.com" 