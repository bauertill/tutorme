import { NextRequest, NextResponse } from "next/server";
import { Server as IOServer } from "socket.io";

export const dynamic = "force-dynamic";

// Store the Socket.io server instance
let io: IOServer;

export async function GET(req: NextRequest) {
  if (!io) {
    // During server startup, create a new Socket.io server
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

  return new NextResponse("Socket.io server is running", { status: 200 });
}

export async function POST(req: NextRequest) {
  return new NextResponse("Socket.io server is running", { status: 200 });
} 