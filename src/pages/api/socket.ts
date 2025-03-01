import { Server as ServerIO } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

const socketHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Check if socket.io server is already initialized
  if ((res.socket as any).server.io) {
    console.log("Socket already running");
  } else {
    console.log("Socket initializing");
    const io = new ServerIO((res.socket as any).server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    // Socket.io event handlers
    io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle drawing data from mobile device
      socket.on("drawing", (data) => {
        console.log(`Drawing data received in room ${data.roomId}`);
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

    // Store the socket.io server instance
    (res.socket as any).server.io = io;
  }

  // Send a successful response
  res.end();
};

export default socketHandler; 