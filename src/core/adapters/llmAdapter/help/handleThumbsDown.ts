import { type Language, LanguageName } from "@/i18n/types";
import { type BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import * as hub from "langchain/hub";
import { z } from "zod";
import { reasoningModel } from "../model";

// Define the system prompt template
const systemPromptTemplate = SystemMessagePromptTemplate.fromTemplate(
  `You are an expert teacher helping a student learn a new concept.
The student may still be confused about the terminology and general ideas.

Instructions:
- Answer the student's question in a pedagogically helpful way.
- Only provide brief hints without giving away the solution.
- Keep it as short as possible and rather expect the user to ask follow up questions if needed.
- Anticipate the questions that the student will ask next, list them in the \`followUpQuestions\` field. At most 3 questions.

The student is working on the following problem:
{problem}

Write your response in {language} language only.`,
  {
    name: "handle_thumbs_down_system_prompt",
  },
);

// Create base prompt template
export const handleThumbsDownPromptTemplate = ChatPromptTemplate.fromMessages([
  systemPromptTemplate,
  new MessagesPlaceholder("solutionImage"),
  new MessagesPlaceholder("conversation"),
]);

// Define the output schema
const HandleThumbsDownSchema = z.object({
  reply: z.string().describe("The reply to the student's question."),
  followUpQuestions: z
    .array(z.string())
    .describe(
      "The questions that the student will most likely ask next, if any.",
    ),
});

export type HandleThumbsDownInput = {
  problemId: string;
  messages: BaseMessage[];
  problem: string;
  solutionImage: string | null;
  language: Language;
};
export type HandleThumbsDownResponse = z.infer<typeof HandleThumbsDownSchema>;

export async function handleThumbsDown(
  input: HandleThumbsDownInput,
): Promise<HandleThumbsDownResponse> {
  const { problemId, messages, problem, solutionImage, language } = input;

  // Use hub to pull the prompt
  const promptFromHub = await hub.pull("handle_thumbs_down");

  const solutionMessage = solutionImage
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
                url: solutionImage,
                detail: "high",
              },
            },
          ],
        }),
      ]
    : [];

  // Invoke the model with the prompt
  const response = await promptFromHub
    .pipe(reasoningModel.withStructuredOutput(HandleThumbsDownSchema))
    .invoke(
      {
        language: LanguageName[language],
        problem,
        solutionImage: solutionMessage,
        conversation: messages,
        reasoning_effort: "high",
      },
      {
        metadata: {
          functionName: "handleThumbsDown",
          problemId,
        },
      },
    );

  return response;
}
