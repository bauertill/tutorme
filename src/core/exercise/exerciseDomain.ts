import { type DBAdapter } from "../adapters/dbAdapter";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type EvaluationResult } from "../assignment/types";
import { type Problem } from "../problem/types";

export async function evaluateSolution(
  exerciseText: string,
  solutionImage: string,
  referenceSolution: string,
  llmAdapter: LLMAdapter,
  // TODO: Add storeAdapter
): Promise<EvaluationResult> {
  const result = await llmAdapter.assignment.evaluateSolution(
    exerciseText,
    solutionImage,
    referenceSolution,
  );
  return result;
}

export async function getRandomProblem(dbAdapter: DBAdapter): Promise<Problem> {
  const problem = await dbAdapter.getRandomProblem();
  return problem;
}

export async function createReferenceSolution(
  exerciseText: string,
  llmAdapter: LLMAdapter,
): Promise<string> {
  const solution = await llmAdapter.assignment.solveProblem(exerciseText);
  return solution;
}
