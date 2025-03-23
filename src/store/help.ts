import { newMessage } from "@/core/help/helpDomain";
import { type Message } from "@/core/help/types";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface HelpSlice {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
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
  setMessages: (messages) =>
    set((draft) => {
      draft.messages = messages;
    }),
  addUserMessage: (content, threadId) =>
    set((draft) => {
      console.log("addUserMessage", content, threadId);
      draft.messages.push(newMessage({ role: "user", content, threadId }));
    }),
  addAssistantMessage: (content, threadId) =>
    set((draft) => {
      draft.messages.push(newMessage({ role: "assistant", content, threadId }));
    }),
});
