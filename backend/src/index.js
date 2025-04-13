import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
// Configure CORS based on environment
const isProduction = process.env.NODE_ENV === 'production';

// Extremely permissive CORS configuration for troubleshooting
app.use(cors({
  origin: true, // Allow any origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie', 'Authorization', 'Content-Type']
}));

// Add pre-flight response for all routes
app.options('*', cors());

// Log CORS configuration
console.log('CORS configured with maximum permissiveness for troubleshooting');

// Add middleware to ensure Authorization header is exposed
app.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', 'Authorization');
  next();
});

// Log environment for debugging
console.log(`Running in ${process.env.NODE_ENV} mode with CORS configured`);


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve frontend in both production and when running from root with npm start
// Determine the correct frontend path based on the environment
let frontendPath;

// Import fs synchronously at the top level
import fs from 'fs';

// Simple function to check if a path exists and contains index.html
function isValidFrontendPath(p) {
  try {
    return fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'));
  } catch (err) {
    console.error(`Error checking path ${p}:`, err.message);
    return false;
  }
}

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../..');
console.log('Project root:', projectRoot);

// Define possible frontend paths in order of preference
const possiblePaths = [
  // Standard locations
  path.join(projectRoot, 'frontend/dist'),
  path.join(projectRoot, 'dist'),

  // Render-specific locations
  '/opt/render/project/src/frontend/dist',
  '/opt/render/project/src/dist',

  // Fallback locations
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(__dirname, '../../frontend/dist')
];

// Log all possible paths for debugging
console.log('Checking these paths for frontend files:');
possiblePaths.forEach((p, i) => console.log(`${i+1}. ${p}`));

// Find the first valid path
for (const p of possiblePaths) {
  if (isValidFrontendPath(p)) {
    frontendPath = p;
    console.log(`✅ Found valid frontend path: ${frontendPath}`);
    break;
  } else {
    console.log(`❌ Invalid frontend path: ${p}`);
  }
}

// If no valid path found, use the first one as fallback
if (!frontendPath) {
  frontendPath = possiblePaths[0];
  console.log(`⚠️ No valid frontend path found, defaulting to: ${frontendPath}`);

  // List directory contents for debugging
  try {
    console.log('Project root contents:');
    console.log(fs.readdirSync(projectRoot));

    console.log('Frontend directory contents (if exists):');
    const frontendDir = path.join(projectRoot, 'frontend');
    if (fs.existsSync(frontendDir)) {
      console.log(fs.readdirSync(frontendDir));
    } else {
      console.log('Frontend directory not found');
    }
  } catch (err) {
    console.error('Error listing directories:', err.message);
  }
}

// Log paths for debugging
console.log("Frontend path:", frontendPath);
console.log("Current directory:", __dirname);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("RENDER:", process.env.RENDER || 'not set');
console.log("RENDER_PROJECT_DIR:", process.env.RENDER_PROJECT_DIR || 'not set');

app.use(express.static(frontendPath));

app.get("*", (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }

  // Check if index.html exists before sending it
  const indexPath = path.join(frontendPath, "index.html");

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`Error: index.html not found at ${indexPath}`);

    // Provide detailed error information
    let errorMessage = `<h1>Frontend files not found</h1>
      <p>The server could not find the frontend files at the expected location.</p>
      <p>Looking for: ${indexPath}</p>
      <h2>Debugging Information:</h2>
      <p>Current directory: ${__dirname}</p>
      <p>Frontend path: ${frontendPath}</p>
      <p>NODE_ENV: ${process.env.NODE_ENV}</p>`;

    // Try to list available directories
    try {
      errorMessage += `<h2>Available directories:</h2><pre>`;
      const projectRoot = path.resolve(__dirname, '../..');
      errorMessage += `Project root (${projectRoot}) contents:\n${fs.readdirSync(projectRoot).join('\n')}\n\n`;

      const frontendDir = path.join(projectRoot, 'frontend');
      if (fs.existsSync(frontendDir)) {
        errorMessage += `Frontend directory contents:\n${fs.readdirSync(frontendDir).join('\n')}\n\n`;

        const distDir = path.join(frontendDir, 'dist');
        if (fs.existsSync(distDir)) {
          errorMessage += `Frontend dist directory contents:\n${fs.readdirSync(distDir).join('\n')}`;
        } else {
          errorMessage += `Frontend dist directory not found`;
        }
      } else {
        errorMessage += `Frontend directory not found`;
      }
      errorMessage += `</pre>`;
    } catch (err) {
      errorMessage += `<p>Error listing directories: ${err.message}</p>`;
    }

    res.status(404).send(errorMessage);
  }
});

server.listen(PORT, async () => {
  console.log("Server is running on PORT:" + PORT);

  // Connect to MongoDB
  const dbConnected = await connectDB();

  if (!dbConnected) {
    console.log("Warning: Server is running without database connection.");
    console.log("Some features may not work properly.");
  }
});
