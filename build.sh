#!/bin/bash

# Install dependencies
npm install
npm install --prefix backend
npm install --prefix frontend

# Build frontend
npm run build --prefix frontend

echo "Build completed successfully!"
