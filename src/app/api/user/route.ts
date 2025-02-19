import { NextRequest, NextResponse } from "next/server";
import { DBAdapter } from "@/core/adapters/dbAdapter";

export async function GET(): Promise<NextResponse> {
  try {
    const dbAdapter = new DBAdapter();
    const users = await dbAdapter.getAllUsers();
    return NextResponse.json({ users }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, name } = await request.json();
    const dbAdapter = new DBAdapter();
    const user = await dbAdapter.createUser(email, name);
    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
