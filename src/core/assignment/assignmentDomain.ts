import { i18n } from "@/i18n/server";
import { type Language } from "@/i18n/types";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { type DBAdapter } from "../adapters/dbAdapter";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type Problem, type StudentSolution } from "../problem/types";
import { type Draft } from "../utils";
import { getExampleProblems } from "./getExampleProblems";
import { type StudentAssignment } from "./types";

export async function adminCreateAssignment(
  {
    name,
    problemIds,
    studentGroupId,
  }: {
    name: string;
    problemIds: string[];
    studentGroupId: string;
  },
  userId: string,
  dbAdapter: DBAdapter,
) {
  const assignmentId = `${userId}-${name}`;
  await dbAdapter.createGroupAssignment(
    {
      id: assignmentId,
      name,
      problemIds,
      studentGroupId,
    },
    userId,
  );
}

export async function createStudentAssignmentFromUpload(
  uploadPath: string,
  userId: string | undefined,
  studentId: string | undefined,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
  language: Language,
): Promise<StudentAssignment> {
  const { problems: rawProblems } =
    await llmAdapter.assignment.extractAssignmentFromImage(
      uploadPath,
      language,
      userId,
    );
  const problems: Draft<Problem>[] = [];
  for (const problem of rawProblems) {
    problems.push({
      problem: problem.problemText,
      problemNumber: problem.problemNumber,
      referenceSolution: null,
    });
  }
  const assignment = {
    name: `Upload @ ${new Date().toLocaleString()}`,
    problems,
  };
  if (userId && studentId) {
    const result = await dbAdapter.createStudentAssignmentWithProblems(
      assignment,
      studentId,
      userId,
    );
    return {
      ...result,
      problems: result.problems.map((problem) => ({
        ...problem,
        studentSolution: {
          id: crypto.randomUUID(),
          status: "INITIAL",
          canvas: { paths: [] },
          evaluation: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })),
    };
  } else {
    return {
      ...assignment,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      problems: assignment.problems.map((problem) => ({
        ...problem,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        studentSolution: {
          id: crypto.randomUUID(),
          status: "INITIAL",
          canvas: { paths: [] },
          evaluation: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })),
    };
  }
}

export async function syncAssignments(
  userId: string,
  dbAdapter: DBAdapter,
  localAssignments: StudentAssignment[],
): Promise<{ assignmentsNotInLocal: StudentAssignment[] }> {
  const studentId = await dbAdapter.getStudentIdByUserIdOrThrow(userId);
  const remoteAssignments =
    await dbAdapter.getStudentAssignmentsByStudentId(studentId);
  const newAssignments = getNewAssignments(remoteAssignments, localAssignments);

  for (const assignment of newAssignments) {
    await dbAdapter.createStudentAssignmentWithProblems(
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

export async function syncStudentSolutions(
  userId: string,
  dbAdapter: DBAdapter,
  localSolutions: StudentSolution[],
): Promise<{ studentSolutionsNotInLocal: StudentSolution[] }> {
  const studentId = await dbAdapter.getStudentIdByUserIdOrThrow(userId);
  const remoteSolutions =
    await dbAdapter.getStudentSolutionsByStudentId(studentId);
  const { solutionsToPush, solutionsToPull } = getStudentSolutionsToPushAndPull(
    localSolutions,
    remoteSolutions,
  );
  for (const solution of solutionsToPush) {
    await dbAdapter.upsertStudentSolution(solution);
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

export function mergeAssignments(
  existingAssignments: StudentAssignment[],
  incomingAssignments: StudentAssignment[],
): StudentAssignment[] {
  const mergedAssignmentsMap = new Map<string, StudentAssignment>();
  for (const assignment of [...existingAssignments, ...incomingAssignments]) {
    const existingAssignment = mergedAssignmentsMap.get(assignment.id);
    if (!existingAssignment) {
      mergedAssignmentsMap.set(assignment.id, assignment);
    } else {
      const mergedAssignment = {
        ...existingAssignment,
        problems: mergeProblemsByUpdatedAt(
          existingAssignment.problems,
          assignment.problems,
        ),
      };
      mergedAssignmentsMap.set(assignment.id, mergedAssignment);
    }
  }
  return Array.from(mergedAssignmentsMap.values());
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

export async function getExampleAssignment(
  language: Language,
): Promise<StudentAssignment> {
  const t = i18n.getFixedT(language);
  const problems = getExampleProblems(language);
  const assignment: StudentAssignment = {
    id: uuidv4(),
    name: t("example_assignment"),
    problems: problems.map((problem, i) => ({
      id: uuidv4(),
      studentSolution: {
        id: crypto.randomUUID(),
        status: "INITIAL",
        canvas: { paths: [] },
        evaluation: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      problem: problem.problem,
      problemNumber: `${i + 1}`,
      referenceSolution: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return assignment;
}
