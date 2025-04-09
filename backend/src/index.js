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
// Configure CORS to allow requests from any origin in development
// and only from the same origin in production
app.use(
  cors({
    origin: true, // Allow any origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Add OPTIONS handling for preflight requests
app.options('*', cors());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve frontend in both production and when running from root with npm start
let frontendPath;

// Determine the correct path based on the environment
if (process.env.NODE_ENV === 'production') {
  // In production on Render, the dist folder is in a different location
  frontendPath = path.join(__dirname, "../frontend/dist");

  // Try alternative paths if the first one doesn't exist
  if (!require('fs').existsSync(frontendPath)) {
    frontendPath = path.join(__dirname, "/frontend/dist");

    if (!require('fs').existsSync(frontendPath)) {
      frontendPath = path.join(__dirname, "frontend/dist");

      if (!require('fs').existsSync(frontendPath)) {
        frontendPath = path.join(__dirname, "dist");
      }
    }
  }
} else {
  // In development
  frontendPath = path.join(__dirname, "../frontend/dist");
}

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

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
