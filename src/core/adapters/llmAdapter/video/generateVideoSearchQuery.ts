import { type Concept } from "@/core/concept/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { fastModel } from "../model";

export const GENERATE_VIDEO_SEARCH_QUERY_PROMPT = `You are an AI assistant that helps create effective search queries for finding educational videos. 
Your goal is to generate a search query that will yield high-quality, educational YouTube videos about a given concept.
The query should be specific enough to find relevant content but not so specific that it limits results.`;

export const GENERATE_VIDEO_SEARCH_QUERY_HUMAN_TEMPLATE = `Generate a search query for finding educational videos about this concept:
Concept name: {conceptName}
Concept description: {conceptDescription}

Return only the search query text without any other explanation or formatting.`;

/**
 * Generate a good search query for finding educational videos about a concept
 * @param concept The concept to search for videos about
 * @returns Promise with recommended search query
 */
export async function generateVideoSearchQuery(
  concept: Concept,
): Promise<string> {
  // @TODO include goal, skill level, user context

  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      GENERATE_VIDEO_SEARCH_QUERY_PROMPT,
    ),
    HumanMessagePromptTemplate.fromTemplate(
      GENERATE_VIDEO_SEARCH_QUERY_HUMAN_TEMPLATE,
    ),
  ]);

  const chain = promptTemplate.pipe(fastModel);
  const response = await chain.invoke(
    {
      conceptName: concept.name,
      conceptDescription: concept.description,
    },
    {
      metadata: {
        conceptId: concept.id,
      },
    },
  );

  // Fix the string conversion issue by explicitly calling toString on the content
  return response.content instanceof Object
    ? JSON.stringify(response.content)
    : String(response.content).trim();
}
