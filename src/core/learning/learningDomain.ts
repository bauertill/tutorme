import type { DBAdapter } from "../adapters/dbAdapter";
import type { LLMAdapter } from "../adapters/llmAdapter";
import type { YouTubeAdapter } from "../adapters/youtubeAdapter";
import type { EducationalVideo, Lesson, LessonIteration, LessonTurn } from "./types";

export async function findEducationalVideo(
  conceptId: string,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
  youtubeAdapter: YouTubeAdapter,
): Promise<EducationalVideo> {
  const concept = await dbAdapter.getConceptById(conceptId);
  const searchQuery = await llmAdapter.generateVideoSearchQuery(concept);
  const videos = await youtubeAdapter.searchEducationalVideos(searchQuery);
  const bestVideo = await llmAdapter.rankVideos(videos, concept);
  return bestVideo;
}

export async function createLesson(
  conceptId: string,
  userId: string,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
): Promise<Lesson> {
  const concept = await dbAdapter.getConceptWithGoalByConceptId(conceptId);
  const {lessonGoal, exercise, explanation} = await llmAdapter.createFirstLessonIteration(
    concept,
    userId,
  );

  const lessonIteration: LessonIteration = {
    turns: [explanation, exercise],
  }

  return await dbAdapter.createLesson(
    lessonGoal,   
    conceptId,
    concept.goalId,
    userId,
    [lessonIteration]
  );
}

export async function addUserInputToLesson(
  lessonId: string,
  userInput: string,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
): Promise<Lesson> {
  const lesson = await dbAdapter.getLessonById(lessonId);
  
  // Ensure the lesson has iterations
  if (lesson.lessonIterations.length === 0) {
    throw new Error("Lesson has no iterations");
  }
  
  const {evaluation, isComplete} = await llmAdapter.createLessonIteration(
    lesson,
    userInput,
  );
  
  const lastIteration = lesson.lessonIterations[lesson.lessonIterations.length - 1]!;
  const userInputTurn: LessonTurn = {
    type: "user_input",
    text: userInput,
  };
  
  const updatedLastIteration: LessonIteration = {
    ...lastIteration,
    turns: [...lastIteration.turns, userInputTurn],
    evaluation,
  };
  
  const updatedLessonIterations = [
    ...lesson.lessonIterations.slice(0, -1),
    updatedLastIteration,
  ];
  
  const updatedLesson = {
    ...lesson,
    lessonIterations: updatedLessonIterations,
    status: isComplete ? "DONE" : lesson.status,
  };
  
  return await dbAdapter.updateLesson(
    updatedLesson,
  );
}



