import { createId } from "@paralleldrive/cuid2";
import {
  type PrismaClient,
  type StudentSolution as StudentSolutionPrisma,
} from "@prisma/client";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type Canvas } from "../canvas/canvas.types";
import {
  evaluateSolution as evaluateSolutionLLM,
  type EvaluateSolutionInput,
} from "./llm/evaluateSolution";
import { judgeHandwriting as judgeHandwritingLLM } from "./llm/judgeHandwriting";
import { StudentSolutionRepository } from "./studentSolution.repository";
import {
  StudentSolution,
  type EvaluationResult,
} from "./studentSolution.types";

export function setStudentSolutionCanvas(
  studentAssignmentId: string,
  problemId: string,
  canvas: Canvas,
  db: PrismaClient,
) {
  const repository = new StudentSolutionRepository(db);
  return repository.updateStudentSolution(studentAssignmentId, problemId, {
    canvas,
  });
}

export function parseStudentSolutionWithDefaults(
  studentSolution: StudentSolutionPrisma | undefined,
  problemId: string,
  studentAssignmentId: string,
): StudentSolution {
  if (!studentSolution) {
    return {
      id: createId(),
      status: "INITIAL",
      canvas: { paths: [] },
      problemId,
      studentAssignmentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  return StudentSolution.parse(studentSolution);
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
