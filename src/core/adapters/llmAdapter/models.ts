import { env } from "@/env";
import { RedisCache } from "@langchain/community/caches/ioredis";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { Redis } from "ioredis";

const client = new Redis(env.REDIS_URL);

const cache = new RedisCache(client);

export const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.0,
  cache,
});

export const nondeterministicModel = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 1.0,
});

export const fastModel = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.0,
  cache,
});

export const reasoningModel = new ChatOpenAI({
  modelName: "o4-mini",
  cache,
});

export const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-lite",
  temperature: 0,
  maxRetries: 2,
  cache,
});
