import { type DBAdapter } from "../adapters/dbAdapter";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type Concept, type Goal } from "./types";

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
