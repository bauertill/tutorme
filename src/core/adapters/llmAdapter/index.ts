import * as concept from "./concept";
import * as lesson from "./lesson";
import * as quiz from "./quiz";
import * as video from "./video";

export const llmAdapter = {
  concept,
  lesson,
  quiz,
  video,
};

export type LLMAdapter = typeof llmAdapter;
