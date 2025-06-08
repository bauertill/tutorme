import { newMessage } from "@/core/help/help.domain";
import { type Message, type RecommendedQuestion } from "@/core/help/help.types";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface HelpSlice {
  messages: Message[];
  recommendedQuestions: RecommendedQuestion[];
  setThreadMessages: (messages: Message[], threadId: string) => void;
  setThreadRecommendedQuestions: (
    questions: string[],
    threadId: string,
  ) => void;
  addUserMessage: (content: string, threadId: string) => void;
  addAssistantMessage: (content: string, threadId: string) => void;
}

export const createHelpSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  HelpSlice
> = (set) => ({
  messages: [],
  recommendedQuestions: [],
  setThreadMessages: (messages, threadId) =>
    set((draft) => {
      draft.messages = draft.messages.filter((m) => m.threadId !== threadId);
      draft.messages.push(...messages);
    }),
  setThreadRecommendedQuestions: (questions, threadId) =>
    set((draft) => {
      draft.recommendedQuestions = draft.recommendedQuestions.filter(
        (q) => q.threadId !== threadId,
      );
      draft.recommendedQuestions.push(
        ...questions.map((q) => ({
          question: q,
          threadId,
        })),
      );
    }),
  addUserMessage: (content, threadId) =>
    set((draft) => {
      draft.messages.push(newMessage({ role: "user", content, threadId }));
    }),
  addAssistantMessage: (content, threadId) =>
    set((draft) => {
      draft.messages.push(newMessage({ role: "assistant", content, threadId }));
    }),
});
