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

export function setStudentSolutionCanvas(
  studentAssignmentId: string,
  problemId: string,
  canvas: Canvas,
  db: PrismaClient,
) {
  const repository = new StudentSolutionRepository(db);
  return repository.upsertStudentSolution(studentAssignmentId, problemId, {
    canvas,
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

export function setStudentSolutionEvaluation(
  studentAssignmentId: string,
  problemId: string,
  evaluation: EvaluationResult,
  db: PrismaClient,
) {
  const repository = new StudentSolutionRepository(db);
  return repository.upsertStudentSolution(studentAssignmentId, problemId, {
    evaluation,
  });
}

export async function evaluateSolution(
  input: EvaluateSolutionInput,
  llmAdapter: LLMAdapter,
): Promise<EvaluationResult> {
  const [evaluation, handwriting] = await Promise.all([
    evaluateSolutionLLM(input, llmAdapter),
    judgeHandwritingLLM(input, llmAdapter),
  ]);

  if (handwriting.agreement) {
    return {
      ...evaluation,
      isLegible: true,
    };
  }

  return {
    ...evaluation,
    isComplete: false,
    isLegible: false,
    hint: handwriting.clarifying_request,
  };
}
