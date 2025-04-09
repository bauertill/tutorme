import { type Language } from "@/i18n/types";
import { type DBAdapter } from "../adapters/dbAdapter";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type EvaluateSolutionInput } from "../adapters/llmAdapter/assignment/evaluateSolution";
import { type EvaluationResult, type UserProblem } from "../assignment/types";
import { type Problem } from "../problem/types";

export async function evaluateSolution(
  input: EvaluateSolutionInput,
  llmAdapter: LLMAdapter,
): Promise<EvaluationResult> {
  return await llmAdapter.assignment.evaluateSolution(input);
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

export async function explainHint(
  userProblem: UserProblem,
  highlightedText: string,
  llmAdapter: LLMAdapter,
): Promise<UserProblem> {
  if (!userProblem.evaluation) return userProblem;

  const detailedHint = await llmAdapter.assignment.explainHintDetail({
    problemId: userProblem.id,
    problemText: userProblem.problem,
    evaluation: userProblem.evaluation,
    highlightedText,
  });

  return {
    ...userProblem,
    evaluation: {
      ...userProblem.evaluation,
      hint: detailedHint,
    },
  };
}
