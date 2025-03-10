import { type DBAdapter } from "../adapters/dbAdapter";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type Problem } from "../problem/types";

export type EvaluationResult = {
  hint?: string;
  hasMistakes: boolean;
  isComplete: boolean;
  analysis: string;
  studentSolution: string;
};

export async function evaluateSolution(
  exerciseText: string,
  solutionImage: string,
  referenceSolution: string,
  llmAdapter: LLMAdapter,
): Promise<EvaluationResult> {
  const result = await llmAdapter.exercise.evaluateSolution(
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
  const solution = await llmAdapter.exercise.solveProblem(exerciseText);
  return solution;
}
