#!/bin/bash

# TMD Quasar App Deployment Script
# Usage: ./deploy.sh

set -e

# SSH connection and remote path
SSH_CONNECTION="netcup-webserver-shared"
REMOTE_PATH="/domains/app.tangomarathons.com"

# Prepare environment variables for production build
echo "🔧 Preparing production environment variables..."

# Bump package.json version (patch) so we can track deployments
echo "🔖 Bumping patch version..."
pnpm version patch --no-git-tag-version --no-commit-hooks --yes || {
  echo "⚠️  Version bump failed – continuing without version change";
}

# Capture bumped version from package.json
APP_VERSION=$(node -p "require('./package.json').version")
echo "   Current version is now $APP_VERSION"

# Commit & tag only if inside git repo
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  if [ -n "$(git status --porcelain)" ]; then
    echo "💾 Committing version bump..."
    git add package.json pnpm-lock.yaml || true
    git commit -m "chore: bump version to v$APP_VERSION" || true

    echo "🏷️  Tagging version $APP_VERSION..."
    if ! git rev-parse "v$APP_VERSION" >/dev/null 2>&1; then
      git tag -a "v$APP_VERSION" -m "Release v$APP_VERSION" || true
      git push origin "$(git branch --show-current)" --tags || true
    else
      echo "⚠️  Tag v$APP_VERSION already exists, skipping tag creation"
    fi
  else
    echo "ℹ️  Working tree clean – nothing to commit"
  fi
fi

# Backup any existing .env
if [ -f .env ]; then
  mv .env .env.backup || true
fi

cp docs/env.prod .env

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