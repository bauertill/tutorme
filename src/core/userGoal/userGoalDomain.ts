import { DBAdapter } from "../adapters/dbAdapter";
import { UserContext, Concept, Goal } from "./types";

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
  userId: string
): Promise<Goal> {
  const goal = await dbAdapter.getGoalByUserId(userId);
  return goal;
}
