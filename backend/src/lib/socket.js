import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Configure Socket.io to allow connections from any origin
const io = new Server(server, {
  cors: {
    origin: true, // Allow any origin
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000, // Increase ping timeout to prevent disconnections
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  console.log("User connected with ID:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("Current online users:", Object.keys(userSocketMap));
  } else {
    console.log("Warning: User connected without userId");
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle connection errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  socket.on("disconnect", (reason) => {
    console.log("A user disconnected", socket.id, "Reason:", reason);
    if (userId) {
      delete userSocketMap[userId];
      console.log("User removed from online users. Current online users:", Object.keys(userSocketMap));
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Ping-pong to keep connection alive
  socket.on("ping", (callback) => {
    if (typeof callback === "function") {
      callback();
    }
  });
});

export { io, app, server };
