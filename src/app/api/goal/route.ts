import { DBAdapter } from "@/core/adapters/dbAdapter";
import { getGoalForUser } from "@/core/goal/goalDomain";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, goalText } = await request.json();

    if (!userId || !goalText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = new DBAdapter();
    const goal = await db.createGoal(userId, goalText);

    return NextResponse.json(goal);
  } catch (_error) {
    console.error("Error creating goal:", _error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const dbAdapter = new DBAdapter();
    const storedGoal = await getGoalForUser(dbAdapter, 1);
    return NextResponse.json({ goal: storedGoal }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to get goal" }, { status: 500 });
  }
}
