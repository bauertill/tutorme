import { type DBAdapter } from "../adapters/dbAdapter";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { Concept } from "../concept/types";
import { type Goal } from "./types";

export async function getGoalById(
  dbAdapter: DBAdapter,
  goalId: string,
): Promise<Goal> {
  return dbAdapter.getGoalById(goalId);
}

export async function getConceptsForGoal(
  llmAdapter: LLMAdapter,
  dbAdapter: DBAdapter,
  goal: Goal,
): Promise<Concept[]> {
  const existingConcepts = await dbAdapter.getConceptsByGoalId(goal.id);
  if (existingConcepts.length > 0) {
    return existingConcepts;
  }
  const newConcepts = await llmAdapter.getConceptsForGoal(goal);
  await dbAdapter.createConcepts(newConcepts);
  return newConcepts;
}
