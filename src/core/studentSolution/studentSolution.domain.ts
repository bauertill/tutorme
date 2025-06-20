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
  studentAssignmentId: string,
  problemId: string,
  recommendedQuestions: RecommendedQuestion[],
  db: PrismaClient,
) {
  const repository = new StudentSolutionRepository(db);
  return repository.upsertStudentSolution(studentAssignmentId, problemId, {
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

export type EvaluateSolutionWithRunIdResult = {
  evaluation: EvaluationResult;
  evaluateSolutionRunId: string;
  handwritingRunId: string;
};

export async function evaluateSolution(
  input: EvaluateSolutionInput,
  llmAdapter: LLMAdapter,
  db: PrismaClient,
): Promise<EvaluateSolutionWithRunIdResult> {
  const [evaluation, handwriting] = await Promise.all([
    evaluateSolutionLLM(input, llmAdapter),
    judgeHandwritingLLM(input, llmAdapter),
  ]);

  await setStudentSolutionCanvas(
    input.studentAssignmentId,
    input.problemId,
    input.canvas,
    db,
  );

  if (handwriting.agreement) {
    return {
      evaluateSolutionRunId: evaluation.runId,
      handwritingRunId: "TODO",
      evaluation: {
        ...evaluation.result,
        isLegible: true,
      },
    };
  }

  return {
    evaluateSolutionRunId: evaluation.runId,
    handwritingRunId: "TODO",
    evaluation: {
      ...evaluation.result,
      isLegible: false,
      hint: handwriting.clarifying_request,
    },
  };
}
