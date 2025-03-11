import * as exercise from "./exercise";
import * as problem from "./problem";

export const llmAdapter = {
  exercise,
  problem,
};

export type LLMAdapter = typeof llmAdapter;
