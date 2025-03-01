import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

// Determine if we're in development mode
const dev = process.env.NODE_ENV !== "production";

// Create the Next.js app handler
const app = next({ dev });
const handle = app.getRequestHandler();

// Initialize Socket.io server
let io: SocketIOServer;

export async function startServer() {
  await app.prepare();
  
  // Create HTTP server
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url || "", true);
    handle(req, res, parsedUrl);
  });
  
  // Initialize Socket.io
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  
  // Socket.io event handlers
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Handle drawing data from mobile device
    socket.on("drawing", (data) => {
      console.log(`Drawing data received from ${socket.id} in room ${data.roomId}:`, data);
      // Broadcast drawing data to all clients in the same room except sender
      socket.to(data.roomId).emit("drawing", data);
    });
    
    // Handle room joining
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`Client ${socket.id} joined room: ${roomId}`);
    });
    
    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
  
  // Start server
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Custom Socket.io server running on port ${PORT}`);
  });
  
  return { server, io };
} 