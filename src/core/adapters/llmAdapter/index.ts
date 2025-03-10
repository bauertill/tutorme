import * as concept from "./concept";
import * as exercise from "./exercise";
import * as lesson from "./lesson";
import * as problem from "./problem";
import * as video from "./video";

export const llmAdapter = {
  concept,
  exercise,
  lesson,
  video,
  problem,
};

export type LLMAdapter = typeof llmAdapter;
