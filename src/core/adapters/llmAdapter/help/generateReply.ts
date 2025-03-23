import { type Message } from "@/core/help/types";
import { type Language, LanguageName } from "@/i18n/types";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { reasoningModel } from "../model";

const SYSTEM_PROMPT = (language: Language) => `\
You are an expert teacher helping a student solve a problem. Answer the student's question in a pedagogically helpful way.

Keep it short and expect the user to ask follow up questions.

Write your response in ${LanguageName[language]} language only.
`;

export async function generateReply(
  messages: Message[],
  language: Language,
): Promise<string> {
  const prompt = [
    new SystemMessage(SYSTEM_PROMPT(language)),
    ...messages.map((message) =>
      message.role === "user"
        ? new HumanMessage(message.content)
        : new AIMessage(message.content),
    ),
  ];

  const response = await reasoningModel.invoke(prompt, {
    reasoning_effort: "high",
  });
  return response.content as string;
}
