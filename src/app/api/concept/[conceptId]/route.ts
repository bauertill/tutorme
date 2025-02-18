import { DBAdapter } from "@/core/adapters/dbAdapter";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { conceptId: string } }
) {
  try {
    const { conceptId } = await params;
    const dbAdapter = new DBAdapter();
    const concept = await dbAdapter.getConceptWithGoalByConceptId(conceptId);
    return NextResponse.json(concept, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get goal" }, { status: 500 });
  }
}
