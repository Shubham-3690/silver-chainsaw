#!/bin/bash

# Start the application in production mode
NODE_ENV=production npm run start:with-frontend --prefix backend

echo "Application started successfully!"
