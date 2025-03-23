import { type Language } from "@/i18n/types";
import { v4 as uuidv4 } from "uuid";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type GenerateReplyResponse } from "../adapters/llmAdapter/help/generateReply";
import { type Draft } from "../utils";
import { type Message } from "./types";

export function newMessage(draft: Draft<Message>): Message {
  return {
    ...draft,
    id: uuidv4(),
    createdAt: new Date(),
  };
}

export async function generateHelpReply(
  messages: Message[],
  problem: string | null,
  solutionImage: string | null,
  llmAdapter: LLMAdapter,
  language: Language,
): Promise<GenerateReplyResponse> {
  return await llmAdapter.help.generateReply(
    messages,
    problem,
    solutionImage,
    language,
  );
}

export async function recommendQuestions(
  problem: string | null,
  solutionImage: string | null,
  llmAdapter: LLMAdapter,
  language: Language,
): Promise<string[]> {
  return await llmAdapter.help.recommendQuestions(
    problem,
    solutionImage,
    language,
  );
}
