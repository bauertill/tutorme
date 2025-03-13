import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { type DBAdapter } from "../adapters/dbAdapter";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type Assignment, type UserProblem } from "./types";

export async function createAssignmentFromUpload(
  uploadPath: string,
  userId: string | undefined,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
): Promise<Assignment> {
  const { assignmentTitle, problems: rawProblems } =
    await llmAdapter.assignment.extractAssignmentFromImage(uploadPath, userId);
  const assignmentId = uuidv4();
  const userProblems: UserProblem[] = rawProblems.map((problem) => ({
    id: uuidv4(),
    // TODO: add problem number
    status: "INITIAL", // TODO: add stars 0-3
    problem: problem.problemText,
    referenceSolution: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignmentId,
    canvas: { paths: [] },
    evaluation: null,
  }));
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
  console.log("syncAssignments", userId);
  console.log("incomingAssignments", incomingAssignments);
  const existingAssignments = await dbAdapter.getAssignmentsByUserId(userId);
  console.log("existingAssignments", existingAssignments);
  const { newAssignments, updateAssignments } = mergeAssignments(
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
export function mergeAssignments(
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
