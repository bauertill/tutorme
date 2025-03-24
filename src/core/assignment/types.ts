import { z } from "zod";
import { type Draft } from "../utils";

export const Point = z.object({
  x: z.number(),
  y: z.number(),
});
export const Path = z.array(Point);
export const Canvas = z.object({
  paths: z.array(Path),
});
export type Canvas = z.infer<typeof Canvas>;

export const EvaluationResult = z.object({
  hint: z.string().optional(),
  hasMistakes: z.boolean(),
  isComplete: z.boolean(),
  analysis: z.string(),
  studentSolution: z.string(),
  followUpQuestions: z.array(z.string()),
});
export type EvaluationResult = z.infer<typeof EvaluationResult>;

export const UserProblem = z.object({
  id: z.string(),
  assignmentId: z.string(),
  problem: z.string(),
  problemNumber: z.string(),
  referenceSolution: z.string().nullable(),
  status: z.enum(["INITIAL", "IN_PROGRESS", "SOLVED", "FAILED"]),
  canvas: Canvas,
  evaluation: EvaluationResult.nullable(),
  createdAt: z.union([z.string().transform((str) => new Date(str)), z.date()]),
  updatedAt: z.union([z.string().transform((str) => new Date(str)), z.date()]),
});

export type UserProblem = z.infer<typeof UserProblem>;
export type UserProblemDraft = Omit<Draft<UserProblem>, "assignmentId">;

export const Assignment = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.union([z.string().transform((str) => new Date(str)), z.date()]),
  updatedAt: z.union([z.string().transform((str) => new Date(str)), z.date()]),
  problems: z.array(UserProblem),
});

export type AssignmentDraft = Omit<Draft<Assignment>, "problems"> & {
  problems: UserProblemDraft[];
};

export type Assignment = z.infer<typeof Assignment>;
