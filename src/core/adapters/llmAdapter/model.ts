import { RedisCache } from "@langchain/community/caches/ioredis";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { Redis } from "ioredis";

const client = new Redis({});

const cache = new RedisCache(client);

export const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
  cache,
});

export const fastModel = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
  cache,
});

export const reasoningModel = new ChatOpenAI({
  modelName: "o3-mini",
  cache,
});

export const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-lite",
  temperature: 0,
  maxRetries: 2,
  cache,
});
