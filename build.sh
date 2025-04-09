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
