import { type Language } from "@/i18n/types";
import { type BaseMessage, SystemMessage } from "@langchain/core/messages";
import { type PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { type Draft } from "../utils";
import { HelpRepository } from "./help.repository";
import { type Message } from "./help.types";
import { messageToLangchainMessage } from "./help.utils";
import { generateReply, type GenerateReplyResponse } from "./llm/generateReply";
import {
  handleThumbsDown,
  type HandleThumbsDownResponse,
} from "./llm/handleThumbsDown";
import { recommendQuestions as recommendQuestionsLLM } from "./llm/recommendQuestions";

export function newMessage(draft: Draft<Message>): Message {
  return {
    ...draft,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
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
  return await generateReply(
    {
      ...input,
      messages: input.messages.map(messageToLangchainMessage),
    },
    llmAdapter,
  );
}

export async function recommendQuestions(
  problem: string,
  solutionImage: string | null,
  llmAdapter: LLMAdapter,
  language: Language,
): Promise<string[]> {
  return await recommendQuestionsLLM(
    problem,
    solutionImage,
    language,
    llmAdapter,
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
  return await handleThumbsDown(
    {
      ...input,
      messages: updatedMessages,
    },
    llmAdapter,
  );
}

export async function getMessages(
  db: PrismaClient,
  studentSolutionId: string,
): Promise<Message[]> {
  const helpRepository = new HelpRepository(db);
  return await helpRepository.getMessages(studentSolutionId);
}

export async function addMessage(
  db: PrismaClient,
  message: Message,
): Promise<Message> {
  const helpRepository = new HelpRepository(db);
  return await helpRepository.addMessage(message);
}
