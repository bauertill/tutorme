import { type DBAdapter } from "../adapters/dbAdapter";
import { llmAdapter } from "../adapters/llmAdapter";
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
): Promise<EvaluationResult> {
  const result = await llmAdapter.exercise.evaluateSolution(
    exerciseText,
    solutionImage,
  );
  return result;
}

export async function getRandomProblem(dbAdapter: DBAdapter): Promise<Problem> {
  const problem = await dbAdapter.getRandomProblem();
  return problem;
}
