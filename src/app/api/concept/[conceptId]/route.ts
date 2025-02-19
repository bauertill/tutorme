import { DBAdapter } from "@/core/adapters/dbAdapter";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    conceptId: string;
  }>;
};

export async function GET(_: Request, { params }: Props) {
  try {
    const { conceptId } = await params;
    const dbAdapter = new DBAdapter();
    const concept = await dbAdapter.getConceptWithGoalByConceptId(conceptId);
    return NextResponse.json(concept, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
  }
}
