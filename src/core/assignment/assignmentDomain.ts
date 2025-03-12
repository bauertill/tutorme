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
    isCorrect: false,
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
