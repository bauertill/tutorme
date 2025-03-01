import type { DBAdapter } from "../adapters/dbAdapter";
import type { LLMAdapter } from "../adapters/llmAdapter";
import type { YouTubeAdapter } from "../adapters/youtubeAdapter";
import type { EducationalVideo, Lesson } from "./types";

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
  goal: string,
  conceptId: string,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
): Promise<Lesson> {
  // const lesson = await dbAdapter.createLesson(goal, conceptId);
  return {
    id: "1",
    goal: "Learn about the concept of " + goal,
    iterations: [],
  };
}



