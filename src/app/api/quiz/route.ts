import { NextRequest, NextResponse } from "next/server";
import { DBAdapter } from "@/core/adapters/dbAdapter";
import { updateConceptMasteryLevel } from "@/core/concept/conceptDomain";

interface SubmitQuizPayload {
  userId: number;
  conceptId: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as SubmitQuizPayload;
    const dbAdapter = new DBAdapter();
    updateConceptMasteryLevel(body.userId, body.conceptId, dbAdapter);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error processing question response:", error);
    return NextResponse.json(
      { error: "Failed to process question response" },
      { status: 500 }
    );
  }
}
