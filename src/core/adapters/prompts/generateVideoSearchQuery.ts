
export const GENERATE_VIDEO_SEARCH_QUERY_PROMPT = `You are an AI assistant that helps create effective search queries for finding educational videos. 
Your goal is to generate a search query that will yield high-quality, educational YouTube videos about a given concept.
The query should be specific enough to find relevant content but not so specific that it limits results.`;

export const GENERATE_VIDEO_SEARCH_QUERY_HUMAN_TEMPLATE = `Generate a search query for finding educational videos about this concept:
Concept name: {conceptName}
Concept description: {conceptDescription}

Return only the search query text without any other explanation or formatting.`;
