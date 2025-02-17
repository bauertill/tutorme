import { DBAdapter } from "@/core/adapters/dbAdapter";
import { getUserById } from "@/core/user/userDomain";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const dbAdapter = new DBAdapter();
    const storedUser = await getUserById(parseInt(userId), dbAdapter );
    return NextResponse.json({ user: storedUser }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
} 