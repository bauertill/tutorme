import { type Language } from "@/i18n/types";
import { type BaseMessage, SystemMessage } from "@langchain/core/messages";
import { v4 as uuidv4 } from "uuid";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type GenerateReplyResponse } from "../adapters/llmAdapter/help/generateReply";
import { type HandleThumbsDownResponse } from "../adapters/llmAdapter/help/handleThumbsDown";
import { type Draft } from "../utils";
import { type Message } from "./help.types";
import { messageToLangchainMessage } from "./help.utils";

export function newMessage(draft: Draft<Message>): Message {
  return {
    ...draft,
    id: uuidv4(),
    createdAt: new Date(),
  };
}

export async function generateHelpReply(
  input: {
    problemId: string;
    messages: Message[];
    problem: string;
    solutionImage: string | null;
    language: Language;
  },
  llmAdapter: LLMAdapter,
): Promise<GenerateReplyResponse> {
  return await llmAdapter.help.generateReply({
    ...input,
    messages: input.messages.map(messageToLangchainMessage),
  });
}

export async function recommendQuestions(
  problem: string,
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

export async function setMessageThumbsDown(
  input: {
    problemId: string;
    messages: Message[];
    problem: string;
    solutionImage: string | null;
    language: Language;
  },
  llmAdapter: LLMAdapter,
): Promise<HandleThumbsDownResponse> {
  const updatedMessages: BaseMessage[] = [
    ...input.messages.map(messageToLangchainMessage),
    new SystemMessage(
      "The user thinks you made a mistake. Double check your previous messages for any errors you may have made. If you did, call these errors out and fix them.",
    ),
  ];
  return await llmAdapter.help.handleThumbsDown({
    ...input,
    messages: updatedMessages,
  });
}
