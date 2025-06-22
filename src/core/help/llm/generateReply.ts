import { type LLMAdapter } from "@/core/adapters/llmAdapter";
import { type Language, LanguageName } from "@/i18n/types";
import { type BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { z } from "zod";

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
    name: "generate_reply_system_prompt",
  },
);

// Create base prompt template
export const generateReplyPromptTemplate = ChatPromptTemplate.fromMessages([
  systemPromptTemplate,
  new MessagesPlaceholder("solutionImage"),
  new MessagesPlaceholder("conversation"),
]);

// Define the output schema
const GenerateReplySchema = z.object({
  reply: z.string().describe("The reply to the student's question."),
  followUpQuestions: z
    .array(z.string())
    .describe(
      "The questions that the student will most likely ask next, if any.",
    ),
});

export type GenerateReplyInput = {
  problemId: string;
  messages: BaseMessage[];
  problem: string;
  solutionImage: string | null;
  language: Language;
};
export type GenerateReplyResponse = z.infer<typeof GenerateReplySchema>;

export async function generateReply(
  input: GenerateReplyInput,
  llmAdapter: LLMAdapter,
): Promise<GenerateReplyResponse> {
  const { problemId, messages, problem, solutionImage, language } = input;

  // Use hub to pull the prompt
  const promptFromHub = await llmAdapter.hub.pull("generate_reply");

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
    .pipe(llmAdapter.models.model.withStructuredOutput(GenerateReplySchema))
    .invoke(
      {
        language: LanguageName[language],
        problem,
        solutionImage: solutionMessage,
        conversation: messages,
      },
      {
        metadata: {
          functionName: "generateReply",
          problemId,
        },
      },
    );

  return response;
}
