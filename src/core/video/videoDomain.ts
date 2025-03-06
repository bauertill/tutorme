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
  // const bestVideo = await llmAdapter.video.rankVideos(videos, concept);
  const bestVideo = videos[0];
  if (!bestVideo) throw new Error("No videos found");
  return bestVideo;
}
