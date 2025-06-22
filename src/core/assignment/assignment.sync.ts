import { type PrismaClient } from "@prisma/client";
import _ from "lodash";
import { type Problem } from "../problem/problem.types";
import { StudentRepository } from "../student/student.repository";
import { AssignmentRepository } from "./assignment.repository";
import { type StudentAssignment } from "./assignment.types";

export async function syncAssignments(
  userId: string,
  db: PrismaClient,
  localAssignments: StudentAssignment[],
): Promise<{ assignmentsNotInLocal: StudentAssignment[] }> {
  const assignmentRepository = new AssignmentRepository(db);
  const studentRepository = new StudentRepository(db);
  const studentId = await studentRepository.getStudentIdByUserIdOrThrow(userId);
  const remoteAssignments =
    await assignmentRepository.getStudentAssignmentsByStudentId(studentId);
  const newAssignments = getNewAssignments(remoteAssignments, localAssignments);

  for (const assignment of newAssignments) {
    await assignmentRepository.createStudentAssignmentWithProblems(
      assignment,
      studentId,
      userId,
    );
  }

  const assignmentsNotInLocal = remoteAssignments.filter(
    (assignment) => !localAssignments.find((a) => a.id === assignment.id),
  );
  console.log("assignmentsNotInLocal", assignmentsNotInLocal);
  return { assignmentsNotInLocal };
}

export function getNewAssignments(
  remoteAssignments: StudentAssignment[],
  localAssignments: StudentAssignment[],
): StudentAssignment[] {
  const remoteAssignmentsMap = new Map<string, StudentAssignment>();
  for (const assignment of remoteAssignments) {
    remoteAssignmentsMap.set(assignment.id, assignment);
  }
  const newAssignments: StudentAssignment[] = [];

  for (const assignment of localAssignments) {
    if (!remoteAssignmentsMap.has(assignment.id)) {
      newAssignments.push(assignment);
    }
  }

  return newAssignments;
}

export function mergeAssignments<T extends string, U extends string>(
  existingAssignments: Record<T, StudentAssignment>,
  incomingAssignments: Record<U, StudentAssignment>,
): Record<T | U, StudentAssignment> {
  const existingIds = new Set<T>(Object.keys(existingAssignments) as T[]);
  const incomingIds = new Set<U>(Object.keys(incomingAssignments) as U[]);
  const newIds = incomingIds.difference(existingIds);
  const mergedAssignmentsMap = new Map<string, StudentAssignment>(
    Object.entries(existingAssignments),
  );
  for (const newId of newIds) {
    mergedAssignmentsMap.set(newId, incomingAssignments[newId]);
  }
  const changedIds = incomingIds.intersection(existingIds);
  for (const changedId of changedIds) {
    const existingAssignment = existingAssignments[changedId];
    const incomingAssignment = incomingAssignments[changedId];
    const mergedAssignment = {
      ...existingAssignment,
      problems: mergeProblemsByUpdatedAt(
        existingAssignment.problems,
        incomingAssignment.problems,
      ),
    };
    mergedAssignmentsMap.set(changedId, mergedAssignment);
  }
  return Object.fromEntries(mergedAssignmentsMap) as Record<
    T | U,
    StudentAssignment
  >;
}

const mergeProblemsByUpdatedAt = (
  existingProblems: Problem[],
  incomingProblems: Problem[],
): Problem[] => {
  const existingProblemsById = new Map<string, Problem>();
  for (const problem of [...existingProblems, ...incomingProblems]) {
    const existingProblem = existingProblemsById.get(problem.id);
    if (!existingProblem) {
      existingProblemsById.set(problem.id, problem);
    } else if (!_.isEqual(existingProblem, problem)) {
      const recentlyUpdatedProblem =
        new Date(existingProblem.updatedAt) > new Date(problem.updatedAt)
          ? existingProblem
          : problem;
      existingProblemsById.set(problem.id, recentlyUpdatedProblem);
    }
  }
  return Array.from(existingProblemsById.values());
};
