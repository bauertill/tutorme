import { z } from "zod";
import { type Draft } from "../utils";

export const UserProblem = z.object({
  id: z.string(),
  assignmentId: z.string(),
  problem: z.string(),
  referenceSolution: z.string(),
  isCorrect: z.boolean(),
  status: z.enum(["INITIAL", "IN_PROGRESS", "SOLVED", "FAILED"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserProblem = z.infer<typeof UserProblem>;
export type UserProblemDraft = Omit<Draft<UserProblem>, "assignmentId">;

export const Assignment = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  problems: z.array(UserProblem),
});

export type AssignmentDraft = Omit<Draft<Assignment>, "problems"> & {
  problems: UserProblemDraft[];
};

export type Assignment = z.infer<typeof Assignment>;
