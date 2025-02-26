import { env } from "@/env";
import { google, youtube_v3 } from "googleapis";
import { EducationalVideo } from "../learning/types";

export class YouTubeAdapter {
  private youtube: youtube_v3.Youtube;

  constructor() {
    this.youtube = google.youtube({
      version: "v3",
      auth: env.YOUTUBE_API_KEY,
    });
  }

  /**
   * Search for educational videos on YouTube
   * @param query The search query
   * @param maxResults The maximum number of results to return (default: 5)
   * @returns Promise with search results
   */
  async searchEducationalVideos(
    query: string,
    maxResults = 10,
  ): Promise<EducationalVideo[]> {
    try {
      const response = await this.youtube.search.list({
        part: ["snippet"],
        q: query,
        maxResults,
        type: ["video"],
        // @TODO decide if we want to filter by category
        // videoCategoryId: '27', // Education category
        relevanceLanguage: "en",
        safeSearch: "strict",
      });
      // @TODO add full description by calling getVideoDetails
      console.log("YOUTUBE RESPONSE", response.data.items);
      return (
        response.data.items?.map((item) => ({
          id: item.id?.videoId ?? "",
          title: item.snippet?.title ?? "",
          description: item.snippet?.description ?? "",
          thumbnailUrl: item.snippet?.thumbnails?.medium?.url ?? "",
          channelTitle: item.snippet?.channelTitle ?? "",
          publishedAt: item.snippet?.publishedAt ?? "",
          duration: 0,
          url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
        })) ?? []
      );
    } catch (error) {
      console.error("Error searching YouTube:", error);
      return [];
    }
  }

  /**
   * Get details for a specific YouTube video
   * @param videoId The YouTube video ID
   */
  async getVideoDetails(videoId: string) {
    try {
      const response = await this.youtube.videos.list({
        part: ["snippet", "contentDetails", "statistics"],
        id: [videoId],
      });

      const video = response.data.items?.[0];
      if (!video) return null;

      return {
        id: video.id ?? "",
        title: video.snippet?.title ?? "",
        description: video.snippet?.description ?? "",
        thumbnailUrl: video.snippet?.thumbnails?.medium?.url ?? "",
        channelTitle: video.snippet?.channelTitle ?? "",
        publishedAt: video.snippet?.publishedAt ?? "",
        duration: video.contentDetails?.duration ?? "",
        viewCount: video.statistics?.viewCount ?? "0",
        likeCount: video.statistics?.likeCount ?? "0",
        url: `https://www.youtube.com/watch?v=${video.id}`,
      };
    } catch (error) {
      console.error("Error getting video details:", error);
      return null;
    }
  }
}

export const youtubeAdapter = new YouTubeAdapter();
