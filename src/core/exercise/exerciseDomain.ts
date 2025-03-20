import { type DBAdapter } from "../adapters/dbAdapter";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type EvaluationResult, type UserProblem } from "../assignment/types";
import { type Problem } from "../problem/types";

export async function evaluateSolution(
  exerciseText: string,
  solutionImage: string,
  referenceSolution: string,
  llmAdapter: LLMAdapter,
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

export async function explainHint(
  userProblem: UserProblem,
  highlightedText: string,
  llmAdapter: LLMAdapter,
): Promise<UserProblem> {
  if (!userProblem.evaluation) return userProblem;

  const detailedHint = await llmAdapter.assignment.explainHintDetail(
    userProblem.problem,
    userProblem.evaluation,
    highlightedText,
  );

  return {
    ...userProblem,
    evaluation: {
      ...userProblem.evaluation,
      hint: detailedHint,
    },
  };
}
