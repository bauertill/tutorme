import { i18n } from "@/i18n/server";
import { type Language } from "@/i18n/types";
import { type PrismaClient } from "@prisma/client";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { getExampleProblems } from "../problem/problem.repository";
import { type Problem } from "../problem/problem.types";
import { StudentRepository } from "../student/student.repository";
import { type Draft } from "../utils";
import { AssignmentRepository } from "./assignment.repository";
import { type StudentAssignment } from "./assignment.types";

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
  db: PrismaClient,
) {
  const assignmentRepository = new AssignmentRepository(db);
  const studentRepository = new StudentRepository(db);
  const assignmentId = `${userId}-${name}`;
  await assignmentRepository.createGroupAssignment(
    {
      id: assignmentId,
      name,
      problemIds,
      studentGroupId,
    },
    userId,
  );
  const students = await studentRepository.getStudentsByGroupId(studentGroupId);
  await Promise.all(
    students.map((student) =>
      assignmentRepository.createStudentAssignment(
        {
          id: `${assignmentId}-${student.id}`,
          name,
          problemIds,
          studentId: student.id,
        },
        userId,
      ),
    ),
  );
}

export async function deleteAllAssignmentsAndProblemsByUserId(
  userId: string,
  db: PrismaClient,
) {
  const assignmentRepository = new AssignmentRepository(db);
  await assignmentRepository.deleteAllProblemsAndAssignmentsByUserId(userId);
}

export async function createStudentAssignmentFromUpload(
  uploadPath: string,
  userId: string | undefined,
  studentId: string | undefined,
  db: PrismaClient,
  llmAdapter: LLMAdapter,
  language: Language,
): Promise<StudentAssignment> {
  const dbAdapter = new AssignmentRepository(db);
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
  db: PrismaClient,
  localAssignments: StudentAssignment[],
): Promise<{ assignmentsNotInLocal: StudentAssignment[] }> {
  const dbAdapter = new AssignmentRepository(db);
  const studentRepository = new StudentRepository(db);
  const studentId = await studentRepository.getStudentIdByUserIdOrThrow(userId);
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
