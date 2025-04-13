#!/bin/bash

# Print Node.js version and environment info
echo "Node.js version:"
node --version
echo "NPM version:"
npm --version
echo "Current directory: $(pwd)"
echo "Directory listing:"
ls -la

# Install dependencies
echo "Installing root dependencies..."
npm install
echo "Installing backend dependencies..."
npm install --prefix backend
echo "Installing frontend dependencies..."
npm install --prefix frontend

# Build frontend
echo "Building frontend..."
npm run build --prefix frontend

# Verify frontend build
echo "Checking frontend build files:"
ls -la frontend/dist

# Create a backup copy of the frontend build in the root directory for Render
echo "Creating backup of frontend build for Render..."
mkdir -p dist
cp -r frontend/dist/* dist/
echo "Backup created in ./dist directory:"
ls -la dist/

# Create or copy environment file for deployment
if [ -f backend/.env.production ]; then
  cp backend/.env.production backend/.env
  echo "Copied production environment file to backend/.env"
else
  # Create a basic .env file if .env.production doesn't exist
  echo "Creating basic .env file"
  cat > backend/.env << EOL
PORT=10000
JWT_SECRET=fallback_secret_key
NODE_ENV=production
EOL
fi

echo "Build completed successfully!"
