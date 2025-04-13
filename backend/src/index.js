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
const frontendPath = path.resolve(__dirname, "../frontend/dist");

console.log("Frontend path:", frontendPath);
console.log("Current directory:", __dirname);
console.log("NODE_ENV:", process.env.NODE_ENV);

app.use(express.static(frontendPath));

app.get("*", (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, "index.html"));
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
