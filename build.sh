#!/bin/bash

# Print Node.js version
node --version
npm --version

# Install dependencies
npm install
npm install --prefix backend
npm install --prefix frontend

# Build frontend
npm run build --prefix frontend

# Copy production environment file for deployment
cp backend/.env.production backend/.env
echo "Copied production environment file to backend/.env"

echo "Build completed successfully!"
