import { NextRequest, NextResponse } from "next/server";
import { getSocketIOInstance } from "@/server/socketio";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Socket.io server
const io = getSocketIOInstance();

export async function GET() {
  return NextResponse.json({ message: "WebSocket Server Status Check" });
}

export async function POST() {
  return NextResponse.json({ message: "WebSocket Server Status Check" });
} 