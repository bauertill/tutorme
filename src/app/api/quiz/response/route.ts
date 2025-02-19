import { NextRequest, NextResponse } from "next/server";
import { DBAdapter } from "@/core/adapters/dbAdapter";
import { z } from "zod";

const SingleQuestionResponseSchema = z.object({
  userId: z.number(),
  questionId: z.string(),
  answer: z.string(),
  quizId: z.string(),
  conceptId: z.string(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = SingleQuestionResponseSchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const { userId, questionId, answer, quizId, conceptId } = body.data;

    const dbAdapter = new DBAdapter();
    const question = await dbAdapter.getQuestionsById(questionId);
    console.log("Found question:", question);

    if (!question) {
      return NextResponse.json(
        { error: `Question ${questionId} not found` },
        { status: 404 }
      );
    }

    // Store the response
    const response = await dbAdapter.createQuestionResponse({
      userId: userId,
      questionId: questionId,
      answer: answer,
      isCorrect: question.correctAnswer === answer,
      quizId: quizId,
      conceptId: conceptId,
    });
    console.log("Created response:", response);

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    // Log the full error details
    console.error("Error processing question response:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Failed to process question response" },
      { status: 500 }
    );
  }
}
