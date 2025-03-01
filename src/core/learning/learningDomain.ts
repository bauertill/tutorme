import type { DBAdapter } from "../adapters/dbAdapter";
import type { LLMAdapter } from "../adapters/llmAdapter";
import type { YouTubeAdapter } from "../adapters/youtubeAdapter";
import type { EducationalVideo, Lesson, LessonIteration } from "./types";

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
  // Get the concept and its details
  const concept = await dbAdapter.getConceptWithGoalByConceptId(conceptId);
  
  // Generate the first lesson iteration using LLM
  const firstIteration = await llmAdapter.createFirstLessonIteration(
    concept,
    userId,
  );

  // Create the lesson in the database
  // @TODO create a separate lessonGoal
  return await dbAdapter.createLesson(
    concept.goal.name,   
    conceptId,
    concept.goalId,
    userId,
    [firstIteration]
  );
}




