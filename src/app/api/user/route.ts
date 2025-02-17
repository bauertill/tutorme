import { DBAdapter } from "@/core/adapters/dbAdapter";
import { createUser, getUserById } from "@/core/user/userDomain";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
      const { name, email } = await request.json();
      const db = new DBAdapter();
      
      const user = await db.createUser(email, name);
      
      return NextResponse.json(user);
    } catch (error) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
  }
  
  export async function GET(request: Request) {
    try {
      const dbAdapter = new DBAdapter();
      const users = await dbAdapter.getAllUsers();
      return NextResponse.json({ users  }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
    }
  }