import { type LLMAdapter } from "@/core/adapters/llmAdapter";
import { LanguageName, type Language } from "@/i18n/types";
import { HumanMessage } from "@langchain/core/messages";
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
- Anticipate the most likely questions that the student will run into when trying to learn the concept.
- If a solution attempt is provided, use it to generate questions that are relevant to the student's current level of understanding.
- Keep each question as short as possible, not repeating the given context.
- Generate at most 3 questions.
- Always wrap LaTeX in the appropriate delimiters.

The student is working on the following problem:

{problem}

Write your response in {language} language only.`,
  {
    name: "recommend_questions_system_prompt",
  },
);

// Create base prompt template
export const recommendQuestionsPromptTemplate = ChatPromptTemplate.fromMessages(
  [systemPromptTemplate, new MessagesPlaceholder("solutionImage")],
);

// Define the output schema
const RecommendQuestionsSchema = z.object({
  questions: z
    .array(z.string())
    .describe("The questions that the student will most likely ask next."),
});

export async function recommendQuestions(
  problem: string,
  solutionImage: string | null,
  language: Language,
  llmAdapter: LLMAdapter,
): Promise<string[]> {
  // Use hub to pull the prompt
  const promptFromHub = await llmAdapter.hub.pull("recommend_questions");

  // Create content array for human message based on available data
  const additionalMessages = [];

  if (solutionImage) {
    additionalMessages.push({
      type: "text",
      text: "Here is the student's (partial) solution attempt:",
    });

    additionalMessages.push({
      type: "image_url",
      image_url: {
        url: solutionImage,
        detail: "high",
      },
    });
  } else {
    additionalMessages.push({
      type: "text",
      text: "The student has not attempted to answer the question yet",
    });
  }

  // Create messages array with system prompt and human message

  // Invoke the model with the messages
  const response = await promptFromHub
    .pipe(
      llmAdapter.models.model.withStructuredOutput(RecommendQuestionsSchema),
    )
    .invoke(
      {
        language: LanguageName[language],
        problem,
        solutionImage: new HumanMessage({
          content: additionalMessages,
        }),
      },
      {
        metadata: {
          functionName: "recommendQuestions",
        },
      },
    );
  return response.questions;
}
