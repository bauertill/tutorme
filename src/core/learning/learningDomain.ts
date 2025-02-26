import { DBAdapter } from "../adapters/dbAdapter";
import { LLMAdapter } from "../adapters/llmAdapter";
import { YouTubeAdapter } from "../adapters/youtubeAdapter";
import { EducationalVideo } from "./types";

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
