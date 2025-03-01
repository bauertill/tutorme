import type { DBAdapter } from "../adapters/dbAdapter";
import type { LLMAdapter } from "../adapters/llmAdapter";
import type { YouTubeAdapter } from "../adapters/youtubeAdapter";
import type {
  EducationalVideo,
  Lesson,
  LessonIteration,
  LessonTurn,
} from "./types";

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

  // Fetch previous lessons for this concept to extract their goals
  const previousLessons = await dbAdapter.getLessonsByConceptId(conceptId);
  const previousLessonGoals = previousLessons.map(
    (lesson) => lesson.lessonGoal,
  );

  // Pass previous lesson goals to help the LLM generate a new, different goal
  const lessonGoal = await llmAdapter.createLessonGoal(
    concept,
    userId,
    previousLessonGoals,
  );

  const { exercise, explanation } = await llmAdapter.createNextLessonIteration(
    concept,
    lessonGoal,
    [],
    userId,
  );

  const lessonIteration: LessonIteration = {
    turns: [explanation, exercise],
  };

  return await dbAdapter.createLesson(
    lessonGoal,
    conceptId,
    concept.goalId,
    userId,
    [lessonIteration],
  );
}

export async function addUserInputToLesson(
  lessonId: string,
  userId: string,
  userInput: string,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
): Promise<Lesson> {
  const lesson = await dbAdapter.getLessonById(lessonId);

  // Ensure the lesson has iterations
  if (lesson.lessonIterations.length === 0) {
    throw new Error("Lesson has no iterations");
  }

  const { evaluation, isComplete } = await llmAdapter.decideNextLessonIteration(
    lesson,
    userInput,
  );
  const lastIteration =
    lesson.lessonIterations[lesson.lessonIterations.length - 1]!;
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

  const concept = await dbAdapter.getConceptById(lesson.conceptId);
  if (!isComplete) {
    const { explanation, exercise } =
      await llmAdapter.createNextLessonIteration(
        concept,
        lesson.lessonGoal,
        updatedLessonIterations,
        userId,
      );

    const newIteration: LessonIteration = {
      turns: [explanation, exercise],
    };

    updatedLessonIterations.push(newIteration);
  }

  const teacherReport = await llmAdapter.createLessonTeacherReport(
    concept,
    lesson,
    userId,
  );
  await dbAdapter.updateConceptWithTeacherReport(concept.id, teacherReport);
  const updatedLesson = {
    ...lesson,
    lessonIterations: updatedLessonIterations,
    status: isComplete ? "DONE" : lesson.status,
  };
  return await dbAdapter.updateLesson(updatedLesson);
}
