import { DBAdapter } from "../adapters/dbAdapter";
import { LLMAdapter } from "../adapters/llmAdapter";
import { Concept, MasteryLevel } from "../goal/types";
import { QuestionResponseWithQuestion, Quiz } from "./types";

const masteryLevels: MasteryLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
];

export async function updateConceptMasteryLevel(
  userId: number,
  conceptId: string,
  dbAdapter: DBAdapter
): Promise<void> {
  // @TODO think about LLM based approach here where we can feed all old responses to the LLM and get a new mastery level
  // Let it decide how heavily to weight answers that are older
  const questionResponses =
    await dbAdapter.getQuestionResponsesByUserIdConceptId(userId, conceptId);

  const newMasteryLevel = getNewMasteryLevel(questionResponses);
  await dbAdapter.updateConceptMasteryLevel(conceptId, newMasteryLevel);
}

export const getNewMasteryLevel = (
  questionResponses: QuestionResponseWithQuestion[]
): MasteryLevel => {
  const sortedQuestionResponses = questionResponses.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  const latestResponse = sortedQuestionResponses[0];
  if (!latestResponse) return "unknown";

  const { quizId } = latestResponse;

  const latestQuizResponses = questionResponses.filter(
    response => response.quizId === quizId
  );
  let newMasteryLevel: MasteryLevel = "unknown";
  for (const masteryLevel of masteryLevels) {
    const questionsAtLevel = latestQuizResponses.filter(
      response => response.question.difficulty === masteryLevel
    );
    if (questionsAtLevel.length === 0) break;

    const hasMasteredLevel = questionsAtLevel.every(
      response => response.isCorrect
    );

    if (hasMasteredLevel) newMasteryLevel = masteryLevel;
    else break;
  }
  return newMasteryLevel;
};

export async function createKnowledgeQuizAndStoreInDB(
  concept: Concept,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter
): Promise<Quiz> {
  try {
    const questions = await llmAdapter.createInitialKnowledgeQuiz(concept);
    const quiz = await dbAdapter.createQuiz(questions, concept.id);
    return quiz;
  } catch (error) {
    console.error("Error creating and storing quiz:", error);
    throw new Error("Failed to create and store quiz");
  }
}
