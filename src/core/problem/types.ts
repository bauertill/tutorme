import { z } from "zod";

export const ProblemUploadStatus = z.enum([
  "PENDING",
  "SUCCESS",
  "ERROR",
  "CANCELLED",
]);

export type ProblemUploadStatus = z.infer<typeof ProblemUploadStatus>;

export const ProblemUpload = z.object({
  id: z.string(),
  fileName: z.string(),
  nRecords: z.number(),
  fileSize: z.number(),
  status: ProblemUploadStatus,
  error: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProblemUpload = z.infer<typeof ProblemUpload>;

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
  successMessage: z.string().optional(),
  hasMistakes: z.boolean(),
  isComplete: z.boolean(),
  isLegible: z.boolean(),
  analysis: z.string(),
  studentSolution: z.string(),
  followUpQuestions: z.array(z.string()),
});
export type EvaluationResult = z.infer<typeof EvaluationResult>;

export const StudentSolution = z.object({
  id: z.string(),
  status: z.enum(["INITIAL", "IN_PROGRESS", "SOLVED"]),
  canvas: Canvas,
  evaluation: EvaluationResult.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type StudentSolution = z.infer<typeof StudentSolution>;

export const Problem = z.object({
  id: z.string(),
  problem: z.string(),
  problemNumber: z.string(),
  referenceSolution: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Problem = z.infer<typeof Problem>;

export const ProblemWithStudentSolution = Problem.extend({
  assignmentId: z.string(),
  studentSolution: StudentSolution,
});

export type ProblemWithStudentSolution = z.infer<
  typeof ProblemWithStudentSolution
>;

export type ProblemQueryResult = {
  problem: Problem;
  score: number;
};
