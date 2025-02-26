import assert from "assert";
import { type DBAdapter } from "../adapters/dbAdapter";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type Concept, type MasteryLevel } from "../goal/types";
import { type QuestionResponseWithQuestion, type Quiz } from "./types";

// TODO: make prisma enum for mastery levels
const masteryLevels: MasteryLevel[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
];
const MAX_QUESTIONS_PER_QUIZ = 5;
export async function updateConceptMasteryLevel(
  userId: string,
  conceptId: string,
  dbAdapter: DBAdapter,
): Promise<void> {
  // @TODO think about LLM based approach here where we can feed all old responses to the LLM and get a new mastery level
  // Let it decide how heavily to weight answers that are older
  const questionResponses =
    await dbAdapter.getQuestionResponsesByUserIdConceptId(userId, conceptId);

  const newMasteryLevel = getNewMasteryLevel(questionResponses);
  await dbAdapter.updateConceptMasteryLevel(conceptId, newMasteryLevel);
}

export const getNewMasteryLevel = (
  questionResponses: QuestionResponseWithQuestion[],
): MasteryLevel => {
  const sortedQuestionResponses = questionResponses.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  const latestResponse = sortedQuestionResponses[0];
  if (!latestResponse) return "UNKNOWN";

  const { quizId } = latestResponse;

  const latestQuizResponses = questionResponses.filter(
    (response) => response.quizId === quizId,
  );
  let newMasteryLevel: MasteryLevel = "UNKNOWN";
  for (const masteryLevel of masteryLevels) {
    const questionsAtLevel = latestQuizResponses.filter(
      (response) => response.question.difficulty === masteryLevel,
    );
    if (questionsAtLevel.length === 0) break;

    const hasMasteredLevel = questionsAtLevel.every(
      (response) => response.isCorrect,
    );

    if (hasMasteredLevel) newMasteryLevel = masteryLevel;
    else break;
  }
  return newMasteryLevel;
};

export async function createKnowledgeQuizAndStoreInDB(
  concept: Concept,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
): Promise<Quiz> {
  try {
    const newQuestion = await llmAdapter.createFirstQuestionForQuiz(concept);
    assert(newQuestion, "No question generated for quiz");
    const quiz = await dbAdapter.createQuiz([newQuestion], concept.id);
    return quiz;
  } catch (error) {
    console.error("Error creating and storing quiz:", error);
    throw new Error("Failed to create and store quiz");
  }
}

export async function addUserResponseToQuiz(
  userId: string,
  quizId: string,
  questionId: string,
  answer: string,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
): Promise<Quiz> {
  const question = await dbAdapter.getQuestionById(questionId);
  const quiz = await dbAdapter.getQuizById(quizId);
  const concept = await dbAdapter.getConceptWithGoalByConceptId(quiz.conceptId);
  assert(concept.goal.userId === userId, "User does not own quiz");
  const isCorrect = answer === question.correctAnswer;
  const response = await dbAdapter.createQuestionResponse({
    quizId,
    questionId,
    isCorrect,
    userId,
    conceptId: quiz.conceptId,
    answer,
  });
  // Update the concept mastery level
  const questionResponses =
    await dbAdapter.getQuestionResponsesByUserIdConceptId(userId, concept.id);

  // Decide whether to continue the quiz or finalize it
  const decision = await llmAdapter.decideNextAction(
    concept,
    questionResponses,
  );
  if (
    decision.action === "finalizeQuiz" ||
    questionResponses.length >= MAX_QUESTIONS_PER_QUIZ
  ) {
    await updateConceptMasteryLevel(userId, quiz.conceptId, dbAdapter);
    return await dbAdapter.updateQuizStatus(quizId, "done");
  }

  // Generate new questions
  const newQuestion = await llmAdapter.createFollowUpQuestion(
    concept,
    questionResponses,
  );
  const updatedQuiz = await dbAdapter.appendQuizQuestion(quizId, newQuestion);
  return updatedQuiz;
}
