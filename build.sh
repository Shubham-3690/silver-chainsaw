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

# Copy .env.sample to backend/.env if .env doesn't exist
if [ ! -f backend/.env ]; then
  cp .env.sample backend/.env
  echo "Created backend/.env from .env.sample"
fi

echo "Build completed successfully!"
