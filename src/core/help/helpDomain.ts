import { v4 as uuidv4 } from "uuid";
import { type Draft } from "../utils";
import { type Message } from "./types";

export function newMessage(draft: Draft<Message>): Message {
  return {
    ...draft,
    id: uuidv4(),
    createdAt: new Date(),
  };
}
