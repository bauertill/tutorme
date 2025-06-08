import { z } from "zod";
import { StudentSolution } from "../studentSolution/studentSolution.types";

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
  studentSolution: StudentSolution,
});

export type ProblemWithStudentSolution = z.infer<
  typeof ProblemWithStudentSolution
>;

export type ProblemQueryResult = {
  problem: Problem;
  score: number;
};
