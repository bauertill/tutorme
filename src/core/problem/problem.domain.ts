import { type Language } from "@/i18n/types";
import { type PrismaClient } from "@prisma/client";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { ProblemRepository } from "./problem.repository";

export async function queryProblems(
  query: string,
  nProblems: number,
  db: PrismaClient,
  problemIdBlackList: string[] = [],
) {
  const problemRepository = new ProblemRepository(db);
  return problemRepository.queryProblems(query, nProblems, problemIdBlackList);
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
