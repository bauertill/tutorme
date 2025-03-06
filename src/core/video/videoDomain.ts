import type { DBAdapter } from "../adapters/dbAdapter";
import type { LLMAdapter } from "../adapters/llmAdapter";
import type { YouTubeAdapter } from "../adapters/youtubeAdapter";
import type { EducationalVideo } from "./types";

export async function findEducationalVideo(
  conceptId: string,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
  youtubeAdapter: YouTubeAdapter,
): Promise<EducationalVideo> {
  const concept = await dbAdapter.getConceptById(conceptId);
  const searchQuery = await llmAdapter.video.generateVideoSearchQuery(concept);
  const videos = await youtubeAdapter.searchEducationalVideos(searchQuery);
  // @TODO decide on better ranking strategy
  return await llmAdapter.video.rankVideos(videos, concept);
}
