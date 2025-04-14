import { type Language, LanguageName } from "@/i18n/types";
import { HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import * as hub from "langchain/hub";
import { z } from "zod";
import { model } from "../model";

export const EvaluateSolutionSchema = z.object({
  studentSolution: z
    .string()
    .describe(
      "The student's solution attempt, verbatim as seen in the image. Discard anything that the student has crossed out.",
    ),
  analysis: z
    .string()
    .describe(
      "A detailed analysis of the student's solution attempt. Identify any mistakes or misconceptions.",
    ),
  hint: z
    .string()
    .optional()
    .describe(
      "A hint to help the student correct the mistakes in their solution, if any.",
    ),
  hasMistakes: z.boolean().describe("Whether the solution has mistakes"),
  isComplete: z
    .boolean()
    .describe("Whether the solution is correct and complete"),
  followUpQuestions: z
    .array(z.string())
    .describe(
      "The questions that the student will most likely ask next, if any.",
    ),
});
export type EvaluateSolutionOutput = z.infer<typeof EvaluateSolutionSchema>;

// Define the system prompt template for evaluating exercise solutions
const systemPromptTemplate = SystemMessagePromptTemplate.fromTemplate(
  `
You are an expert teacher helping a student learn a new concept.
The student may still be confused about the terminology and general ideas.
You will be given the problem statement, a reference solution, and an image of the student's handwritten or drawn (partial) solution attempt.

- Take a close look at the submitted image and take note of any parts that the student has crossed out or scribbled over.
- Write down the student's solution verbatim as seen in the image. Discard anything that the student has crossed out or scribbled over.
- Analyze each step of the student's solution attempt and interpret what the student is trying to do. Identify any mistakes or misconceptions.
- If there are mistakes or the solution is incomplete, write down a hint to help the student correct the mistakes.
- Ignore any mistakes that are in parts that are crossed out or scribbled over.
- Anticipate the questions that the student will ask next, list them in the \`followUpQuestions\` field. At most 3 questions.

Keep your output concise. Always wrap LaTeX in the appropriate delimiters.

Write your response in {language} language only.
`,
  {
    name: "evaluate_solution_system_prompt",
  },
);

// Define the human message template with problem statement and reference solution
const humanPromptTemplate = HumanMessagePromptTemplate.fromTemplate(
  `
Problem statement:
"""
{exerciseText}
"""

Reference solution:
"""
{referenceSolution}
"""

Here is the student's (partial) solution attempt:
`,
  {
    name: "evaluate_solution_human_prompt",
  },
);

// Combine the templates into a single prompt template
export const evaluateSolutionPromptTemplate = ChatPromptTemplate.fromMessages([
  systemPromptTemplate,
  humanPromptTemplate,
]);

export type EvaluateSolutionInput = {
  problemId: string;
  exerciseText: string;
  solutionImage: string;
  referenceSolution: string;
  language: Language;
};

// Function to evaluate the solution using the multimodal LLM
export async function evaluateSolution(
  input: EvaluateSolutionInput,
): Promise<z.infer<typeof EvaluateSolutionSchema>> {
  const {
    problemId,
    exerciseText,
    solutionImage,
    referenceSolution,
    language,
  } = input;
  // Extract the base64 data part (remove the prefix if it exists)
  const base64Data = solutionImage.includes("base64,")
    ? solutionImage.split("base64,")[1]
    : solutionImage;

  // Create a formatted prompt using the prompt template
  const formattedPrompt = await evaluateSolutionPromptTemplate.formatMessages({
    language: LanguageName[language],
    exerciseText,
    referenceSolution,
  });

  // Add the image to the last message (which is the human message)
  const lastMessage = formattedPrompt[formattedPrompt.length - 1];
  if (lastMessage instanceof HumanMessage) {
    lastMessage.content = [
      {
        type: "text",
        text: lastMessage.content as string,
      },
      {
        type: "image_url",
        image_url: {
          url: `data:image/png;base64,${base64Data}`,
          detail: "high",
        },
      },
    ];
  }

  const prompt = await hub.pull("evaluate_solution");
  const response = await prompt
    .pipe(model.withStructuredOutput(EvaluateSolutionSchema))
    .invoke(
      {
        exerciseText,
        referenceSolution,
        language: LanguageName[language],
      },
      {
        metadata: {
          functionName: "evaluateSolution",
          problemId,
        },
      },
    );

  return response;
}
