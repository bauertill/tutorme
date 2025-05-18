import { i18n } from "@/i18n/server";
import { type Language } from "@/i18n/types";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { type DBAdapter } from "../adapters/dbAdapter";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { getExampleProblems } from "./getExampleProblems";
import { type Assignment, type UserProblem } from "./types";

export async function adminUploadProblems(
  uploadPath: string,
  userId: string | undefined,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
  language: Language,
): Promise<UserProblem[]> {
  const { assignmentTitle, problems: rawProblems } =
    await llmAdapter.assignment.extractAssignmentFromImage(
      uploadPath,
      language,
      userId,
    );
  const assignmentId = uuidv4();
  const userProblems: UserProblem[] = [];
  for (const problem of rawProblems) {
    userProblems.push({
      id: uuidv4(),
      status: "INITIAL", // TODO: add stars 0-3
      problem: problem.problemText,
      problemNumber: problem.problemNumber,
      referenceSolution: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      relevantImageSegment: problem.relevantImageSegment ?? undefined,
      imageUrl: uploadPath,
      assignmentId,
      canvas: { paths: [] },
      evaluation: null,
    });
  }
  return userProblems;
}

export async function createAssignmentFromUpload(
  uploadPath: string,
  userId: string | undefined,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
  language: Language,
): Promise<Assignment> {
  const { assignmentTitle, problems: rawProblems } =
    await llmAdapter.assignment.extractAssignmentFromImage(
      uploadPath,
      language,
      userId,
    );
  const assignmentId = uuidv4();
  const userProblems: UserProblem[] = [];
  for (const problem of rawProblems) {
    userProblems.push({
      id: uuidv4(),
      status: "INITIAL", // TODO: add stars 0-3
      problem: problem.problemText,
      problemNumber: problem.problemNumber,
      referenceSolution: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      relevantImageSegment: problem.relevantImageSegment ?? undefined,
      imageUrl: uploadPath,
      assignmentId,
      canvas: { paths: [] },
      evaluation: null,
    });
  }
  const assignment: Assignment = {
    id: assignmentId,
    name: assignmentTitle,
    problems: userProblems,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  if (userId) {
    return await dbAdapter.createAssignment(assignment, userId);
  }
  return assignment;
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
  incomingAssignments: Assignment[],
): Promise<{ assignmentsNotInLocal: Assignment[] }> {
  const existingAssignments = await dbAdapter.getAssignmentsByUserId(userId);
  const { newAssignments, updateAssignments } = getUpdatedAndNewAssignments(
    existingAssignments,
    incomingAssignments,
  );

  for (const assignment of updateAssignments) {
    await dbAdapter.updateUserProblems(
      assignment.problems,
      userId,
      assignment.id,
    );
  }
  for (const assignment of newAssignments) {
    await dbAdapter.createAssignment(assignment, userId);
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
  existingAssignments: Assignment[],
  incomingAssignments: Assignment[],
): { updateAssignments: Assignment[]; newAssignments: Assignment[] } {
  const existingAssignmentsMap = new Map<string, Assignment>();
  for (const assignment of existingAssignments) {
    existingAssignmentsMap.set(assignment.id, assignment);
  }
  const updateAssignments: Assignment[] = [];
  const newAssignments: Assignment[] = [];

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
  existingAssignments: Assignment[],
  incomingAssignments: Assignment[],
): Assignment[] {
  const mergedAssignmentsMap = new Map<string, Assignment>();
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
  existingProblems: UserProblem[],
  incomingProblems: UserProblem[],
): UserProblem[] => {
  const existingProblemsById = new Map<string, UserProblem>();
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
): Promise<Assignment> {
  const t = i18n.getFixedT(language);
  const problems = getExampleProblems(language);
  const assignmentId = uuidv4();
  const assignment: Assignment = {
    id: assignmentId,
    name: t("example_assignment"),
    problems: problems.map((problem, i) => ({
      id: uuidv4(),
      assignmentId,
      status: "INITIAL",
      problem: problem.problem,
      problemNumber: `${i + 1}`,
      referenceSolution: null,
      canvas: { paths: [] },
      evaluation: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return assignment;
}
