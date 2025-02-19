import { DBAdapter } from "../adapters/dbAdapter";
import { LLMAdapter } from "../adapters/llmAdapter";
import { Concept } from "../goal/types";
import { Quiz } from "./types";

export async function updateConceptMasteryLevel(
  userId: number,
  conceptId: string,
  dbAdapter: DBAdapter
): Promise<void> {
  const questionResponses =
    await dbAdapter.getQuestionResponsesByUserIdConceptId(userId, conceptId);
  await dbAdapter.updateConceptMasteryLevel(conceptId, "beginner");
}

export async function createKnowledgeQuizAndStoreInDB(
  concept: Concept,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter
): Promise<Quiz> {
  try {
    const questions = await llmAdapter.createKnowledgeQuiz(concept);
    const quiz = await dbAdapter.createQuiz(questions, concept.id);
    return quiz;
  } catch (error) {
    console.error("Error creating and storing quiz:", error);
    throw new Error("Failed to create and store quiz");
  }
}
