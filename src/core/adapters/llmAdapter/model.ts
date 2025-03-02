import { ChatOpenAI } from "@langchain/openai";

export const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
});
