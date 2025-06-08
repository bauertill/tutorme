import { type Language } from "@/i18n/types";
import { type DBAdapter } from "../adapters/dbAdapter";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type EvaluateSolutionInput } from "../adapters/llmAdapter/assignment/evaluateSolution";
import { type Problem } from "../problem/types";
import { type EvaluationResult } from "../studentSolution/types";

export async function evaluateSolution(
  input: EvaluateSolutionInput,
  llmAdapter: LLMAdapter,
): Promise<EvaluationResult> {
  const [evaluation, handwriting] = await Promise.all([
    llmAdapter.assignment.evaluateSolution(input),
    llmAdapter.assignment.judgeHandwriting(input),
  ]);

  if (handwriting.agreement) {
    return {
      ...evaluation,
      isLegible: true,
    };
  }

  return {
    ...evaluation,
    isComplete: false,
    isLegible: false,
    hint: handwriting.clarifying_request,
  };
}

export async function getRandomProblem(dbAdapter: DBAdapter): Promise<Problem> {
  const problem = await dbAdapter.getRandomProblem();
  return problem;
}

export async function createReferenceSolution(
  exerciseText: string,
  llmAdapter: LLMAdapter,
  language: Language,
): Promise<string> {
  const solution = await llmAdapter.assignment.solveProblem(
    exerciseText,
    language,
  );
  return solution;
}
