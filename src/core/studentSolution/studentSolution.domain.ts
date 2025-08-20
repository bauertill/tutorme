import { type PrismaClient } from "@prisma/client";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type Canvas } from "../canvas/canvas.types";
import { type RecommendedQuestion } from "../help/help.types";
import {
  evaluateSolution as evaluateSolutionLLM,
  type EvaluateSolutionInput,
} from "./llm/evaluateSolution";
import { judgeHandwriting as judgeHandwritingLLM } from "./llm/judgeHandwriting";
import { StudentSolutionRepository } from "./studentSolution.repository";
import { type EvaluationResult } from "./studentSolution.types";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

export async function setStudentSolutionCanvas(
  studentSolutionId: string,
  userId: string,
  problemId: string,
  canvas: Canvas,
  db: PrismaClient,
) {
  try {
    const repository = new StudentSolutionRepository(db);
    const result = await repository.updateStudentSolution(studentSolutionId, {
      canvas,
    });
    return result;
  } catch (error) {
    console.error("Failed to set canvas:", error);
    throw error;
  }
}

export function setStudentSolutionEvaluateResult(
  studentSolutionId: string,
  problemId: string,
  userId: string,
  evaluation: EvaluationResult,
  db: PrismaClient,
) {
  const repository = new StudentSolutionRepository(db);
  return repository.updateStudentSolution(studentSolutionId, {
    evaluation,
  });
}

export function setStudentSolutionRecommendedQuestions(
  studentSolutionId: string,
  recommendedQuestions: RecommendedQuestion[],
  db: PrismaClient,
) {
  const repository = new StudentSolutionRepository(db);
  return repository.updateStudentSolution(studentSolutionId, {
    recommendedQuestions,
  });
}

// @TODO discuss if thisn't overkill?
// Why go roundtrip with optimistic update?
export function setStudentSolutionEvaluation(
  studentSolutionId: string,
  evaluation: EvaluationResult,
  db: PrismaClient,
) {
  const repository = new StudentSolutionRepository(db);
  return repository.updateStudentSolution(studentSolutionId, {
    evaluation,
    status: evaluation.isComplete ? "SOLVED" : "IN_PROGRESS",
  });
}

export function storeStudentSolutionCanvasWithEvaluationResult(
  payload: {
    studentSolutionId: string;
    userId: string;
    problemId: string;
    evaluation: EvaluationResult;
    canvas: Canvas;
  },
  db: PrismaClient,
) {
  const { studentSolutionId, evaluation, canvas } = payload;
  const repository = new StudentSolutionRepository(db);
  return repository.updateStudentSolution(studentSolutionId, {
    canvas,
    evaluation,
  });
}

export async function evaluateSolution(
  input: EvaluateSolutionInput,
  llmAdapter: LLMAdapter,
  db: PrismaClient,
): Promise<EvaluationResult> {
  const [evaluationSolution, handwriting] = await Promise.all([
    evaluateSolutionLLM(input, llmAdapter),
    judgeHandwritingLLM(input, llmAdapter),
  ]);
  const evaluation = handwriting.agreement
    ? {
        ...evaluationSolution,
        isLegible: true,
        evaluateSolutionRunId: evaluationSolution.runId,
        handwritingRunId: "TODO",
      }
    : {
        ...evaluationSolution,
        isLegible: false,
        hint: handwriting.clarifying_request,
        evaluateSolutionRunId: evaluationSolution.runId,
        handwritingRunId: "TODO",
      };

  try {
    void storeStudentSolutionCanvasWithEvaluationResult(
      {
        studentSolutionId: input.studentSolutionId,
        canvas: input.canvas,
        evaluation,
        userId: input.userId,
        problemId: input.problemId,
      } as any,
      db,
    );
  } catch (error) {
    console.error("Error storing solution canvas with evaluation:", error);
  }
  return evaluation;
}
