import { Server as IOServer } from "socket.io";

// Create a singleton instance of Socket.io server
let io: IOServer | null = null;

export function getSocketIOInstance() {
  if (!io) {
    console.log("Initializing Socket.io server...");
    
    io = new IOServer({
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
  }
  
  return io;
} 