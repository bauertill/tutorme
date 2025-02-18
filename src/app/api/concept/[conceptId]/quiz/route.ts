import { NextRequest, NextResponse } from "next/server";
import { createKnowledgeQuizAndStoreInDB } from "@/core/concept/conceptDomain";
import { PrismaClient } from "@prisma/client";
import { LLMAdapter } from "@/core/adapters/llmAdapter";
import { Concept } from "@/core/goal/types";
import { DBAdapter } from "@/core/adapters/dbAdapter";

export async function POST(
  req: NextRequest,
  { params }: { params: { conceptId: string } }
) {
  try {
    const { conceptId } = await params;
    const dbAdapter = new DBAdapter();
    // Get the concept from the database
    const concept = await dbAdapter.getConceptWithGoalByConceptId(conceptId);

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

// Get all quizzes for a concept
export async function GET(
  req: NextRequest,
  { params }: { params: { conceptId: string } }
) {
  try {
    const prisma = new PrismaClient();
    const quizzes = await prisma.quiz.findMany({
      where: {
        conceptId: params.conceptId,
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}
