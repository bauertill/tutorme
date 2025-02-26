import { Command } from "@langchain/langgraph";
import assert from "assert";
import { type DBAdapter } from "../adapters/dbAdapter";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type Concept, type MasteryLevel } from "../goal/types";
import { createAssessmentGraph } from "./assessmentGraph";
import { type QuestionResponseWithQuestion, type Quiz } from "./types";

// TODO: make prisma enum for mastery levels
const masteryLevels: MasteryLevel[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
];

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
    const questions = await llmAdapter.createInitialKnowledgeQuiz(concept);
    const quiz = await dbAdapter.createQuiz(questions, concept.id);
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
) {
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
  await updateConceptMasteryLevel(userId, quiz.conceptId, dbAdapter);
  return response;
}

export async function invokeAssessmentGraph(
  llmAdapter: LLMAdapter,
  userResponse?: string,
) {
  const graph = await createAssessmentGraph(llmAdapter);
  const config = { configurable: { thread_id: "1" } };
  const inputs = userResponse
    ? new Command({
        resume: userResponse,
      })
    : null;
  const result = await graph.invoke(inputs, config);
  return result;
}
