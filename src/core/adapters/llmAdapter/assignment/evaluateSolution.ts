import { type Language, LanguageName } from "@/i18n/types";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { model } from "../model";

const schema = z.object({
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

// Define the system prompt for evaluating exercise solutions
const EVALUATE_SOLUTION_SYSTEM_PROMPT = (language: Language) => `\
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

Write your response in ${LanguageName[language]} language only.
`;

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
): Promise<z.infer<typeof schema>> {
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

  // Create messages for the LLM
  const messages = [
    new SystemMessage(EVALUATE_SOLUTION_SYSTEM_PROMPT(language)),
    new HumanMessage({
      content: [
        {
          type: "text",
          text: `\
Problem statement:
"""
${exerciseText}
"""

Reference solution:
"""
${referenceSolution}
"""

Here is the student's (partial) solution attempt:`,
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
  ];

  // Make the call to the multimodal LLM
  const response = await model.withStructuredOutput(schema).invoke(messages, {
    metadata: {
      functionName: "evaluateSolution",
      problemId,
    },
  });

  return response;
}
