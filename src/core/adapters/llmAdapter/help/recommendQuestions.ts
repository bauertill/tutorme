import { type Language, LanguageName } from "@/i18n/types";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "node_modules/zod/lib";
import { model } from "../model";

const SYSTEM_PROMPT = (language: Language) => `\
You are an expert teacher helping a student solve a problem.

Instructions:
- Anticipate the most likely questions that the student will run into when trying to solve the problem.
- Keep each question as short as possible, not repeating the given context.
- Generate at most 3 questions.
- Always wrap LaTeX in the appropriate delimiters.

Write your response in ${LanguageName[language]} language only.
`;

const schema = z.object({
  questions: z
    .array(z.string())
    .describe("The questions that the student will most likely ask next."),
});

export async function recommendQuestions(
  problem: string | null,
  solutionImage: string | null,
  language: Language,
): Promise<string[]> {
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
  ];

  const response = await model.withStructuredOutput(schema).invoke(prompt);
  return response.questions;
}
