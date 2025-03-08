import * as concept from "./concept";
import * as exercise from "./exercise";
import * as lesson from "./lesson";
import * as video from "./video";

export const llmAdapter = {
  concept,
  exercise,
  lesson,
  video,
};

export type LLMAdapter = typeof llmAdapter;
