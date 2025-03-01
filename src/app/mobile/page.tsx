"use client";

import { nanoid } from "nanoid";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function MobileDrawingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [roomId, setRoomId] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const searchParams = useSearchParams();
  const socketRef = useRef<any>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas and socket connection
  useEffect(() => {
    // Get room ID from URL params or generate a new one
    const urlRoomId = searchParams.get("roomId");
    const sessionRoomId = urlRoomId || nanoid(6);
    setRoomId(sessionRoomId);

    // Setup canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Make canvas responsive to screen size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Initialize canvas context
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#000000";
        contextRef.current = ctx;
      }
    };

    // Resize canvas on window resize
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Initialize Socket.io client
    const socketInitializer = async () => {
      try {
        console.log("Initializing socket connection...");
        // Dynamically import socket.io-client to avoid SSR issues
        const io = (await import("socket.io-client")).io;

        // Use the server's IP address - same as in the URL bar
        const serverUrl = window.location.origin;
        console.log(`Connecting to socket server at: ${serverUrl}`);

        // Connect to socket server (using Pages API route)
        const socket = io(serverUrl, {
          path: "/api/socket",
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          transports: ["websocket", "polling"],
        });

        socket.on("connect", () => {
          console.log("Connected to socket server with ID:", socket.id);
          setIsConnected(true);
          setErrorMessage("");

          // Join drawing room
          socket.emit("join-room", sessionRoomId);
          console.log("Joined room:", sessionRoomId);
        });

        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err);
          setIsConnected(false);
          setErrorMessage(`Connection error: ${err.message}`);
        });

        socket.on("disconnect", (reason) => {
          console.log("Disconnected from socket server:", reason);
          setIsConnected(false);
        });

        socket.on("drawing", (data: any) => {
          console.log("Received drawing data:", data);
          drawOnCanvas(data.x0, data.y0, data.x1, data.y1, data.color);
        });

        socketRef.current = socket;
      } catch (error) {
        console.error("Socket initialization error:", error);
        setErrorMessage(
          `Initialization error: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    socketInitializer();

    // Cleanup function
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [searchParams]);

  // Drawing functions
  const startDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return;

    setIsDrawing(true);

    const touch = e.touches[0];
    if (!touch) return;

    const clientX = touch.clientX;
    const clientY = touch.clientY;

    contextRef.current.beginPath();
    contextRef.current.moveTo(clientX, clientY);

    // Store the current point
    lastPointRef.current = { x: clientX, y: clientY };
  };

  const draw = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !socketRef.current) return;

    const touch = e.touches[0];
    if (!touch) return;

    const clientX = touch.clientX;
    const clientY = touch.clientY;
    const ctx = contextRef.current;

    // Get previous point
    const lastPoint = lastPointRef.current || { x: clientX, y: clientY };

    // Draw line on local canvas
    ctx.lineTo(clientX, clientY);
    ctx.stroke();

    // Send drawing data to server
    const drawingData = {
      roomId,
      x0: lastPoint.x,
      y0: lastPoint.y,
      x1: clientX,
      y1: clientY,
      color: ctx.strokeStyle,
    };

    console.log("Emitting drawing data:", drawingData);
    socketRef.current.emit("drawing", drawingData);

    // Update last point
    lastPointRef.current = { x: clientX, y: clientY };
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;

    contextRef.current.closePath();
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  // Function to draw received data on canvas
  const drawOnCanvas = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,
  ) => {
    if (!contextRef.current) return;

    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      <div className="fixed left-0 top-0 z-10 rounded-br-lg bg-white/80 p-4 text-lg font-bold">
        Room: {roomId}
        <span
          className={`ml-2 inline-block h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
        ></span>
      </div>

      {errorMessage && (
        <div className="fixed left-0 top-14 z-10 rounded-br-lg bg-red-100 p-2 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none"
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      <div className="fixed bottom-4 left-0 right-0 flex justify-center">
        <div className="rounded-full bg-white/80 px-4 py-2 text-sm">
          Drawing on mobile device{" "}
          {isConnected ? "(Connected)" : "(Disconnected)"}
        </div>
      </div>
    </div>
  );
}
