import { type Message } from "@/core/help/types";
import { type Language, LanguageName } from "@/i18n/types";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { z } from "zod";
import { model } from "../model";

const SYSTEM_PROMPT = (language: Language) => `\
You are an expert teacher helping a student learn a new concept.
The student may still be confused about the terminology and general ideas.

Instructions:
- Answer the student's question in a pedagogically helpful way.
- Only provide brief hints without giving away the solution.
- Keep it as short as possible and rather expect the user to ask follow up questions if needed.
- Anticipate the questions that the student will ask next, list them in the \`followUpQuestions\` field. At most 3 questions.

Write your response in ${LanguageName[language]} language only.
`;

const schema = z.object({
  reply: z.string().describe("The reply to the student's question."),
  followUpQuestions: z
    .array(z.string())
    .describe(
      "The questions that the student will most likely ask next, if any.",
    ),
});

export type GenerateReplyInput = {
  problemId: string;
  messages: Message[];
  problem: string | null;
  solutionImage: string | null;
  language: Language;
};
export type GenerateReplyResponse = z.infer<typeof schema>;

export async function generateReply(
  input: GenerateReplyInput,
): Promise<GenerateReplyResponse> {
  const { problemId, messages, problem, solutionImage, language } = input;
  const base64Data = solutionImage?.includes("base64,")
    ? solutionImage.split("base64,")[1]
    : solutionImage;

  const prompt = [
    new SystemMessage(SYSTEM_PROMPT(language)),
    ...(problem
      ? [
          new HumanMessage({
            content: [
              {
                type: "text",
                text: `\
Problem statement:
"""
${problem}
"""
`,
              },
            ],
          }),
        ]
      : []),
    ...(solutionImage
      ? [
          new HumanMessage({
            content: [
              {
                type: "text",
                text: `Here is the student's (partial) solution attempt:`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Data}`,
                  detail: "high",
                },
              },
            ],
          }),
        ]
      : []),
    ...messages.map((message) =>
      message.role === "user"
        ? new HumanMessage(message.content)
        : new AIMessage(message.content),
    ),
  ];

  const response = await model.withStructuredOutput(schema).invoke(prompt, {
    metadata: {
      functionName: "generateReply",
      problemId,
    },
  });
  return response;
}
