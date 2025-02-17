import { DBAdapter } from "@/core/adapters/dbAdapter";
import { storeGoalForUserInDb } from "@/core/userGoal/userGoalDomain";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal } = body;
    const dbAdapter = new DBAdapter();
    const storedGoal = await storeGoalForUserInDb(dbAdapter, goal);
    return NextResponse.json({ goal: storedGoal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save goal" }, { status: 500 });
  }
}
