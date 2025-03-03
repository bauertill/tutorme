import { type DBAdapter } from "../adapters/dbAdapter";
import { LLMAdapter } from "../adapters/llmAdapter";
import { Concept } from "./types";

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
