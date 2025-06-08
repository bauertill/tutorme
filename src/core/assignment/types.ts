import { z } from "zod";
import { Problem, ProblemWithStudentSolution } from "../problem/types";

export const ImageRegion = z.object({
  topLeft: z.object({
    x: z.number(),
    y: z.number(),
  }),
  bottomRight: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const GroupAssignment = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.union([z.string().transform((str) => new Date(str)), z.date()]),
  updatedAt: z.union([z.string().transform((str) => new Date(str)), z.date()]),
  problems: z.array(Problem),
  studentGroup: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export const StudentAssignment = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.union([z.string().transform((str) => new Date(str)), z.date()]),
  updatedAt: z.union([z.string().transform((str) => new Date(str)), z.date()]),
  problems: z.array(Problem),
  groupAssignment: GroupAssignment.optional(),
  studentId: z.string().optional(),
});

export const StudentAssignmentWithStudentSolutions = StudentAssignment.extend({
  problems: z.array(ProblemWithStudentSolution),
});

export type GroupAssignment = z.infer<typeof GroupAssignment>;

export type StudentAssignment = z.infer<typeof StudentAssignment>;

export type StudentAssignmentWithStudentSolutions = z.infer<
  typeof StudentAssignmentWithStudentSolutions
>;
