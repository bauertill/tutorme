import * as hub from "langchain/hub";
import * as models from "./models";

export const llmAdapter = {
  hub,
  models,
};

export type LLMAdapter = typeof llmAdapter;
