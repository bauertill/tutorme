import { type DBAdapter } from "../adapters/dbAdapter";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type PubSubAdapter } from "../adapters/pubsubAdapter";
import { type Goal } from "../goal/types";
import { type Concept } from "./types";

export async function updateConceptMasteryLevelAndTeacherReport(
  userId: string,
  concept: Concept,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
): Promise<void> {
  const lessons = await dbAdapter.getLessonsByConceptId(concept.id);
  const { masteryLevel, teacherReport } =
    await llmAdapter.concept.evaluateStudentConceptUnderstanding(
      concept,
      lessons,
      userId,
    );

  await dbAdapter.updateConceptMasteryLevelAndTeacherReport(
    concept.id,
    masteryLevel,
    teacherReport,
  );
}

export async function generateConceptsForGoal(
  goal: Goal,
  llmAdapter: LLMAdapter,
  dbAdapter: DBAdapter,
  pubsubAdapter: PubSubAdapter,
): Promise<void> {
  const newConceptsIterator = llmAdapter.concept.generateConceptsForGoal(goal);
  for await (const concept of newConceptsIterator) {
    void pubsubAdapter.publish("concept:generated", concept, goal.id);
    await dbAdapter.createConcept(concept);
  }
  void pubsubAdapter.publishEndOfGeneration("concept:generated", goal.id);
  await dbAdapter.updateGoalGenerationStatus(goal.id, "COMPLETED");
}
