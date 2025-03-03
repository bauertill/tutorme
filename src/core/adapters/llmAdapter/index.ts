import * as concept from "./concept";
import * as lesson from "./lesson";
import * as video from "./video";

export const llmAdapter = {
  concept,
  lesson,
  video,
};

export type LLMAdapter = typeof llmAdapter;
