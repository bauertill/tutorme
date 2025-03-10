import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";

export const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
});

export const fastModel = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});

export const reasoningModel = new ChatOpenAI({
  modelName: "o3-mini",
});

export const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-lite",
  temperature: 0,
  maxRetries: 2,
});
