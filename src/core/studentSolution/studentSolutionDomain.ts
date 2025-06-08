import { createId } from "@paralleldrive/cuid2";
import { type StudentSolution as StudentSolutionPrisma } from "@prisma/client";
import { StudentSolution } from "./types";

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
      evaluation: null,
      problemId,
      studentAssignmentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  return StudentSolution.parse(studentSolution);
}
