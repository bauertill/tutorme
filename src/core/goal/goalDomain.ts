import type { DBAdapter } from "../adapters/dbAdapter";
import type { LLMAdapter } from "../adapters/llmAdapter";
import { type PubSubAdapter } from "../adapters/pubsubAdapter";
import { generateConceptsForGoal } from "../concept/conceptDomain";
import type { Goal, GoalWithConcepts } from "./types";

export async function createGoal(
  dbAdapter: DBAdapter,
  userId: string,
  name: string,
  llmAdapter: LLMAdapter,
  pubSubAdapter: PubSubAdapter,
): Promise<Goal> {
  const goal = await dbAdapter.createGoal(userId, name);
  void generateConceptsForGoal(goal, llmAdapter, dbAdapter, pubSubAdapter);
  return goal;
}

export async function getGoalById(
  dbAdapter: DBAdapter,
  goalId: string,
): Promise<Goal> {
  return dbAdapter.getGoalById(goalId);
}

export async function getGoalByIdIncludeConcepts(
  dbAdapter: DBAdapter,
  goalId: string,
): Promise<GoalWithConcepts> {
  return dbAdapter.getGoalByIdIncludeConcepts(goalId);
}
