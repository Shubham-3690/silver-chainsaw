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

// Check if we're on Render (production environment)
if (process.env.RENDER) {
  // Try multiple possible paths on Render
  const possiblePaths = [
    path.resolve(process.env.RENDER_PROJECT_DIR || '/opt/render/project/src', 'frontend/dist'),
    path.resolve(process.env.RENDER_PROJECT_DIR || '/opt/render/project/src', 'dist'),
    path.resolve('/opt/render/project/src', 'frontend/dist'),
    path.resolve('/opt/render/project/src', 'dist')
  ];

  // Use the first path that exists and contains index.html
  import('fs').then(fs => {
    for (const p of possiblePaths) {
      if (fs.existsSync(path.join(p, 'index.html'))) {
        frontendPath = p;
        console.log(`Found frontend files at: ${frontendPath}`);
        break;
      }
    }

    // If no valid path found, default to the first one
    if (!frontendPath) {
      frontendPath = possiblePaths[0];
      console.log(`No valid frontend path found, defaulting to: ${frontendPath}`);
    }
  }).catch(err => {
    console.error('Error checking frontend paths:', err);
    frontendPath = possiblePaths[0];
  });

  // Set a default while the async check runs
  frontendPath = path.resolve(process.env.RENDER_PROJECT_DIR || '/opt/render/project/src', 'dist');
} else if (process.env.NODE_ENV === 'production') {
  // In production but not on Render (e.g., other hosting)
  frontendPath = path.resolve(__dirname, '../../frontend/dist');
} else {
  // In development
  frontendPath = path.resolve(__dirname, '../frontend/dist');
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

  // Use fs to check if the file exists
  import('fs').then(fs => {
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error(`Error: index.html not found at ${indexPath}`);
      res.status(404).send(`Frontend files not found. Please make sure the frontend is built correctly.<br>\nLooking for: ${indexPath}`);
    }
  }).catch(err => {
    console.error('Error checking for index.html:', err);
    res.status(500).send('Server error checking for frontend files');
  });
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
