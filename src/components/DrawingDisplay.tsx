"use client";

import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";

interface DrawingDisplayProps {
  width?: number;
  height?: number;
}

export default function DrawingDisplay({
  width = 800,
  height = 600,
}: DrawingDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    // Generate a unique room ID if one doesn't exist
    if (!roomId) {
      setRoomId(nanoid(6));
    }

    // Setup canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    // Initialize canvas context
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#000000";
      contextRef.current = ctx;
    }

    // Initialize Socket.io client
    const socketInitializer = async () => {
      // Dynamically import socket.io-client to avoid SSR issues
      const io = (await import("socket.io-client")).io;

      try {
        // Connect to socket server
        const socket = io(window.location.origin, {
          path: "/api/socket",
        });

        socket.on("connect", () => {
          console.log("Drawing display connected to socket server");
          setIsConnected(true);

          // Join drawing room
          socket.emit("join-room", roomId);
        });

        socket.on("drawing", (data: any) => {
          drawOnCanvas(data.x0, data.y0, data.x1, data.y1, data.color);
        });

        socketRef.current = socket;
      } catch (error) {
        console.error("Socket initialization error:", error);
        setIsConnected(false);
      }
    };

    socketInitializer();

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, width, height]);

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

    // Scale coordinates to match canvas dimensions
    const scaleX = width / window.innerWidth;
    const scaleY = height / window.innerHeight;

    const scaledX0 = x0 * scaleX;
    const scaledY0 = y0 * scaleY;
    const scaledX1 = x1 * scaleX;
    const scaledY1 = y1 * scaleY;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(scaledX0, scaledY0);
    ctx.lineTo(scaledX1, scaledY1);
    ctx.stroke();
    ctx.closePath();
  };

  // Clear the canvas
  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;

    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );
  };

  // Generate a new room ID
  const generateNewRoom = () => {
    clearCanvas();
    setRoomId(nanoid(6));
  };

  // Get the URL for the mobile PWA
  const getMobileURL = () => {
    if (typeof window === "undefined") return "";

    // run: ifconfig | grep inet to get the local network IP address
    // Use the server's local network IP address instead of localhost
    // This allows mobile devices on the same network to connect
    return `http://192.168.0.149:3000/mobile?roomId=${roomId}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <canvas
          ref={canvasRef}
          className="rounded-md border border-gray-300"
          width={width}
          height={height}
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-sm">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="text-sm font-medium">Room ID: {roomId}</div>

        <div className="mt-4 flex flex-col items-center">
          <p className="mb-2 text-sm text-gray-600">
            Scan this QR code or visit the URL on your mobile device:
          </p>

          <div className="mb-2 rounded-md border border-gray-200 bg-white p-2">
            <QRCodeSVG value={getMobileURL()} size={150} />
          </div>

          <div className="mb-2 overflow-hidden rounded bg-gray-100 px-3 py-1 font-mono text-xs">
            {getMobileURL()}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={clearCanvas}>
          Clear Canvas
        </Button>
        <Button variant="outline" onClick={generateNewRoom}>
          New Room
        </Button>
      </div>
    </div>
  );
}
