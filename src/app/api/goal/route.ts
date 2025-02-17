import { DBAdapter } from "@/core/adapters/dbAdapter";
import {
  getGoalForUser,
  storeGoalForUserInDb,
} from "@/core/userGoal/userGoalDomain";
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

export async function GET() {
  try {
    const dbAdapter = new DBAdapter();
    const storedGoal = await getGoalForUser(dbAdapter, 1);
    console.log("storedGoal", storedGoal);
    return NextResponse.json({ goal: storedGoal }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get goal" }, { status: 500 });
  }
}
