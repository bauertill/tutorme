import { DBAdapter } from "../adapters/dbAdapter";
import { LLMAdapter } from "../adapters/llmAdapter";
import { Concept, Goal } from "./types";

export function getRequiredConceptsForGoal(goal: Goal): Concept[] {
  return [];
}

export async function storeGoalForUserInDb(
  dbAdapter: DBAdapter,
  goal: string
): Promise<Goal | undefined> {
  let user = await dbAdapter.getUserById(1);
  if (!user) {
    // create a dummy user if one doesn't exist
    user = await dbAdapter.createUser("test@tutor_me.com", "test");
  }

  const storedGoal = await dbAdapter.createGoal(user.id, goal);
  return storedGoal;
}
export async function getGoalForUser(
  dbAdapter: DBAdapter,
  userId: number
): Promise<Goal[]> {
  return await dbAdapter.getUserGoals(userId);
}

export async function getConceptsForGoal(
  llmAdapter: LLMAdapter,
  dbAdapter: DBAdapter,
  goal: Goal
): Promise<Concept[]> {
  // const existingConcepts = await dbAdapter.getConceptsByGoalId(goal.id);
  // if (existingConcepts.length > 0) {
  //   return existingConcepts;
  // }
  const newConcepts = await llmAdapter.getConceptsForGoal(goal);
  // await dbAdapter.createConcepts(newConcepts);
  return newConcepts;
}
