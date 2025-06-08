import { type Language } from "@/i18n/types";
import type { DBAdapter } from "../adapters/dbAdapter";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type Problem } from "./problem.types";

export async function queryProblems(
  query: string,
  nProblems: number,
  dbAdapter: DBAdapter,
  problemIdBlackList: string[] = [],
) {
  return dbAdapter.queryProblems(query, nProblems, problemIdBlackList);
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
