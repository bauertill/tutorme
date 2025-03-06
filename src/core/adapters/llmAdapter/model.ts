import { ChatOpenAI } from "@langchain/openai";

export const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
});

export const fastModel = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});
