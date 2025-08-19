import { z } from "zod";
import { Canvas } from "../canvas/canvas.types";
import { RecommendedQuestion } from "../help/help.types";

export const EvaluationResult = z.object({
  hint: z.string().optional(),
  successMessage: z.string().optional(),
  hasMistakes: z.boolean(),
  isComplete: z.boolean(),
  isLegible: z.boolean(),
  analysis: z.string(),
  studentSolution: z.string(),
  followUpQuestions: z.array(z.string()),
  evaluateSolutionRunId: z.string().optional().nullable(),
  handwritingRunId: z.string().optional().nullable(),
});
export type EvaluationResult = z.infer<typeof EvaluationResult>;

export const StudentSolution = z.object({
  id: z.string(),
  status: z.enum(["INITIAL", "IN_PROGRESS", "SOLVED"]),
  canvas: Canvas,
  evaluation: EvaluationResult.nullable(),
  studentAssignmentId: z.string(),
  problemId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().nullable(),
  recommendedQuestions: z.array(RecommendedQuestion),
});

export type StudentSolution = z.infer<typeof StudentSolution>;
