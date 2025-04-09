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
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve frontend in both production and when running from root with npm start
const frontendPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, "../frontend/dist")
  : path.join(__dirname, "../frontend/dist");

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
