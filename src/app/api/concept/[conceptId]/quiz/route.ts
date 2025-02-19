import { NextRequest, NextResponse } from "next/server";
import { createKnowledgeQuizAndStoreInDB } from "@/core/concept/conceptDomain";
import { LLMAdapter } from "@/core/adapters/llmAdapter";
import { DBAdapter } from "@/core/adapters/dbAdapter";
import { z } from "zod";

const QuizCreatePayload = z.object({
  conceptId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = QuizCreatePayload.parse(await req.json());
    const dbAdapter = new DBAdapter();
    // Get the concept from the database
    const concept = await dbAdapter.getConceptWithGoalByConceptId(
      body.conceptId
    );

    if (!concept) {
      return NextResponse.json({ error: "Concept not found" }, { status: 404 });
    }
    const llmAdapter = new LLMAdapter();
    // Generate and store the quiz
    const quiz = await createKnowledgeQuizAndStoreInDB(
      concept,
      dbAdapter,
      llmAdapter
    );

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
