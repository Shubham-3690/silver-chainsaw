#!/bin/bash

# Print environment information
echo "Node.js version:"
node --version
echo "NPM version:"
npm --version
echo "Current directory: $(pwd)"
echo "Environment variables:"
echo "PORT=${PORT:-10000}"
echo "NODE_ENV=${NODE_ENV:-production}"
echo "RENDER=${RENDER:-not set}"
echo "RENDER_PROJECT_DIR=${RENDER_PROJECT_DIR:-not set}"

# Check for frontend build files
echo "Checking for frontend build files:"
ls -la frontend/dist 2>/dev/null || echo "frontend/dist not found"
ls -la dist 2>/dev/null || echo "dist not found"

# Start the application in production mode
echo "Starting application with PORT=${PORT:-10000}"
NODE_ENV=production RENDER=true npm run start:with-frontend --prefix backend

echo "Application started successfully!"
