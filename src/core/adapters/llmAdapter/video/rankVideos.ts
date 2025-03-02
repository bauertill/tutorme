import { type Concept } from "@/core/concept/types";
import { type EducationalVideo } from "@/core/video/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "../model";

export const RANK_VIDEOS_SYSTEM_PROMPT = `You are an AI educational content curator tasked with selecting the best educational video for a given concept.

Your goal is to analyze a list of videos and rank them based on their relevance, quality, and educational value for the specific concept.

Consider these factors when ranking:
1. Relevance to the concept
2. Educational value
3. Clarity and presentation quality
4. Comprehensiveness
5. Engagement factor
6. Appropriateness for the user's mastery level

The user's mastery level (UNKNOWN, BEGINNER, INTERMEDIATE, ADVANCED, EXPERT) should influence your selection:
- For UNKNOWN or BEGINNER: Prefer introductory, foundational content that explains basics clearly
- For INTERMEDIATE: Prefer content that builds on fundamentals and introduces more complex aspects
- For ADVANCED: Prefer content that covers advanced topics and nuances
- For EXPERT: Prefer content that discusses cutting-edge developments, edge cases, or specialized applications

Select the single best video that would help someone with this mastery level learn this concept effectively.`;

export const RANK_VIDEOS_HUMAN_TEMPLATE = `Concept: {conceptName}
Concept Description: {conceptDescription}
User's Mastery Level: {masteryLevel}

Videos to rank:
{videosJson}

Analyze these videos and select the best one for learning about this concept for someone with a {masteryLevel} mastery level. Return the ID of the best video.`;

/**
 * Rank a list of educational videos based on their relevance to a concept
 * @param videos List of educational videos to rank
 * @param concept The concept to rank videos against
 * @returns Promise with the highest ranked video
 */
export async function rankVideos(
  videos: EducationalVideo[],
  concept: Concept,
): Promise<EducationalVideo> {
  // If there's only one video or no videos, return the first one or throw an error
  if (videos.length === 0) {
    throw new Error("No videos to rank");
  }

  if (videos.length === 1 && videos[0]) return videos[0];

  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(RANK_VIDEOS_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.fromTemplate(RANK_VIDEOS_HUMAN_TEMPLATE),
  ]);

  const schema = z.object({
    bestVideoId: z
      .string()
      .describe("The ID of the best video for learning this concept"),
  });

  const chain = promptTemplate
    .pipe(model.withStructuredOutput(schema))
    .withConfig({
      tags: ["video-ranking"],
      runName: "Rank Educational Videos",
    });

  const response = await chain.invoke(
    {
      conceptName: concept.name,
      conceptDescription: concept.description,
      masteryLevel: concept.masteryLevel,
      videosJson: JSON.stringify(videos, null, 2),
    },
    {
      metadata: {
        conceptId: concept.id,
      },
    },
  );

  // Find the best video by ID
  const bestVideoId = response.bestVideoId;
  const bestVideo = videos.find((video) => video.id === bestVideoId);
  if (bestVideo) {
    return bestVideo;
  }
  throw new Error("No best video found", { cause: response });
}
