#!/bin/bash

# Print Node.js version
node --version
npm --version

# Start the application in production mode
echo "Starting application with PORT=${PORT:-10000}"
NODE_ENV=production npm run start:with-frontend --prefix backend

echo "Application started successfully!"
