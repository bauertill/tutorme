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

export function setStudentSolutionEvaluateResult(
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
  });
}

export function storeStudentSolutionCanvasWithEvaluationResult(
  payload: {
    studentAssignmentId: string;
    problemId: string;
    evaluation: EvaluationResult;
    canvas: Canvas;
  },
  db: PrismaClient,
) {
  const { studentAssignmentId, problemId, evaluation, canvas } = payload;
  const repository = new StudentSolutionRepository(db);
  return repository.upsertStudentSolution(studentAssignmentId, problemId, {
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

  void storeStudentSolutionCanvasWithEvaluationResult(
    { ...input, evaluation },
    db,
  );
  return evaluation;
}
