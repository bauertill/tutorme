import * as hub from "langchain/hub";
import * as datasets from "./datasets";
import * as models from "./models";

export const llmAdapter = {
  hub,
  models,
  datasets,
};

export type LLMAdapter = typeof llmAdapter;
