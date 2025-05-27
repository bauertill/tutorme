import {
  type BaseMessage,
  AIMessage,
  HumanMessage,
} from "@langchain/core/messages";
import { type Message } from "./types";

export function messageToLangchainMessage(message: Message): BaseMessage {
  switch (message.role) {
    case "user":
      return new HumanMessage(message.content);
    case "assistant":
      return new AIMessage(message.content);
  }
}
