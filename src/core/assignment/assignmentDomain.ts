import { i18n } from "@/i18n/server";
import { type Language } from "@/i18n/types";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { type DBAdapter } from "../adapters/dbAdapter";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type ProblemWithStudentSolution } from "../problem/types";
import { type Draft } from "../utils";
import { getExampleProblems } from "./getExampleProblems";
import {
  type StudentAssignment,
  type StudentAssignmentWithStudentSolutions,
} from "./types";

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
): Promise<StudentAssignmentWithStudentSolutions> {
  const { problems: rawProblems } =
    await llmAdapter.assignment.extractAssignmentFromImage(
      uploadPath,
      language,
      userId,
    );
  const problems: Draft<ProblemWithStudentSolution>[] = [];
  for (const problem of rawProblems) {
    problems.push({
      problem: problem.problemText,
      problemNumber: problem.problemNumber,
      referenceSolution: null,
      assignmentId: "asdsad",
      studentSolution: {
        id: crypto.randomUUID(),
        status: "INITIAL",
        canvas: { paths: [] },
        evaluation: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
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
        assignmentId: result.id,
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
    const assignmentId = uuidv4();
    return {
      ...assignment,
      id: assignmentId,
      createdAt: new Date(),
      updatedAt: new Date(),
      problems: assignment.problems.map((problem) => ({
        ...problem,
        assignmentId,
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

/**
 * The local assignments are updated or created in the DB.
 * Then all assignments are returned that are not in the local assignments
 * (This happens for new devices or when the user leaves the page before an upload is complete)
 * @param userId
 * @param dbAdapter
 * @param incomingAssignments
 * @returns
 */
export async function syncAssignments(
  userId: string,
  dbAdapter: DBAdapter,
  incomingAssignments: StudentAssignment[],
): Promise<{ assignmentsNotInLocal: StudentAssignment[] }> {
  const existingAssignments =
    await dbAdapter.getStudentAssignmentsByUserId(userId);
  const { newAssignments, updateAssignments } = getUpdatedAndNewAssignments(
    existingAssignments,
    incomingAssignments,
  );

  for (const assignment of updateAssignments) {
    // TODO: Implement update problems
    // await dbAdapter.updateProblems(assignment.problems, userId, assignment.id);
  }
  for (const assignment of newAssignments) {
    // TODO: Implement create assignment
    // await dbAdapter.createAssignment(assignment, userId);
  }

  const assignmentsNotInLocal = existingAssignments.filter(
    (assignment) => !incomingAssignments.find((a) => a.id === assignment.id),
  );
  console.log("assignmentsNotInLocal", assignmentsNotInLocal);
  return { assignmentsNotInLocal };
}
/**
 * Merge incoming assignments with existing assignments.
 * If an assignment is present in the incoming assignments, but not in the existing it is added.
 * If an assignment is present in both, the incoming one is kept.
 * @param existingAssignments
 * @param incomingAssignments
 * @returns
 */
export function getUpdatedAndNewAssignments(
  existingAssignments: StudentAssignment[],
  incomingAssignments: StudentAssignment[],
): {
  updateAssignments: StudentAssignment[];
  newAssignments: StudentAssignment[];
} {
  const existingAssignmentsMap = new Map<string, StudentAssignment>();
  for (const assignment of existingAssignments) {
    existingAssignmentsMap.set(assignment.id, assignment);
  }
  const updateAssignments: StudentAssignment[] = [];
  const newAssignments: StudentAssignment[] = [];

  for (const assignment of incomingAssignments) {
    const existingAssignment = existingAssignmentsMap.get(assignment.id);
    if (existingAssignment) {
      if (!_.isEqual(existingAssignment, assignment)) {
        updateAssignments.push(assignment);
      }
    } else {
      newAssignments.push(assignment);
    }
  }

  return { updateAssignments, newAssignments };
}

/**
 * Merge incoming assignments with existing assignments.
 * Add any userProblems from the incoming assignments if they are not already present in the existing assignments.
 * @param existingAssignments
 * @param incomingAssignments
 * @returns
 */
export function mergeAssignments(
  existingAssignments: StudentAssignmentWithStudentSolutions[],
  incomingAssignments: StudentAssignmentWithStudentSolutions[],
): StudentAssignmentWithStudentSolutions[] {
  const mergedAssignmentsMap = new Map<
    string,
    StudentAssignmentWithStudentSolutions
  >();
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
  existingProblems: ProblemWithStudentSolution[],
  incomingProblems: ProblemWithStudentSolution[],
): ProblemWithStudentSolution[] => {
  const existingProblemsById = new Map<string, ProblemWithStudentSolution>();
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
  // TODO: Merge student solutions
  return Array.from(existingProblemsById.values());
};

export async function getExampleAssignment(
  language: Language,
): Promise<StudentAssignmentWithStudentSolutions> {
  const t = i18n.getFixedT(language);
  const problems = getExampleProblems(language);
  const assignmentId = uuidv4();
  const assignment: StudentAssignmentWithStudentSolutions = {
    id: assignmentId,
    name: t("example_assignment"),
    problems: problems.map((problem, i) => ({
      id: uuidv4(),
      assignmentId,
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
