import * as assignment from "./assignment";
import * as help from "./help";

export const llmAdapter = {
  assignment,
  help,
};

export type LLMAdapter = typeof llmAdapter;
