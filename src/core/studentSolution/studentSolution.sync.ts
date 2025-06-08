import { type PrismaClient } from "@prisma/client";
import _ from "lodash";
import { StudentRepository } from "../student/student.repository";
import { StudentSolutionRepository } from "./studentSolution.repository";
import { type StudentSolution } from "./studentSolution.types";

export async function syncStudentSolutions(
  userId: string,
  db: PrismaClient,
  localSolutions: StudentSolution[],
): Promise<{ studentSolutionsNotInLocal: StudentSolution[] }> {
  const studentRepository = new StudentRepository(db);
  const studentSolutionRepository = new StudentSolutionRepository(db);
  const studentId = await studentRepository.getStudentIdByUserIdOrThrow(userId);
  const remoteSolutions =
    await studentSolutionRepository.getStudentSolutionsByStudentId(studentId);
  const { solutionsToPush, solutionsToPull } = getStudentSolutionsToPushAndPull(
    localSolutions,
    remoteSolutions,
  );
  for (const solution of solutionsToPush) {
    await studentSolutionRepository.upsertStudentSolution(solution);
  }
  return { studentSolutionsNotInLocal: solutionsToPull };
}
export function getStudentSolutionsToPushAndPull(
  localSolutions: StudentSolution[],
  remoteSolutions: StudentSolution[],
): {
  solutionsToPush: StudentSolution[];
  solutionsToPull: StudentSolution[];
} {
  const localSolutionsMap = new Map<string, StudentSolution>();
  const remoteSolutionsMap = new Map<string, StudentSolution>();
  for (const solution of localSolutions) {
    localSolutionsMap.set(solution.id, solution);
  }
  for (const solution of remoteSolutions) {
    remoteSolutionsMap.set(solution.id, solution);
  }

  const solutionsToPush: StudentSolution[] = [];
  const solutionsToPull: StudentSolution[] = [];

  for (const remoteSolution of remoteSolutions) {
    const localSolution = localSolutionsMap.get(remoteSolution.id);
    if (localSolution) {
      if (!_.isEqual(localSolution, remoteSolution)) {
        if (localSolution.updatedAt < remoteSolution.updatedAt) {
          solutionsToPull.push(remoteSolution);
        } else {
          solutionsToPush.push(localSolution);
        }
      }
    } else {
      solutionsToPull.push(remoteSolution);
    }
  }

  for (const localSolution of localSolutions) {
    const remoteSolution = remoteSolutionsMap.get(localSolution.id);
    if (!remoteSolution) {
      solutionsToPush.push(localSolution);
    }
  }

  return { solutionsToPush, solutionsToPull };
}
