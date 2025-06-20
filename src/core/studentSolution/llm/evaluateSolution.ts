import { type LLMAdapter } from "@/core/adapters/llmAdapter";
import { type Canvas } from "@/core/canvas/canvas.types";
import { type Language, LanguageName } from "@/i18n/types";
import { HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { z } from "zod";

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
  successMessage: z
    .string()
    .optional()
    .describe(
      "If the solution is correct, briefly state the student's correct solution.",
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
Here is the student's (partial) solution attempt. Please analyse the image below and provide your feedback.
If the image does not contain any solution, state that isComplete is false and provide a hint to the student to help him get started...
`,
  {
    name: "evaluate_solution_human_prompt",
  },
);

// Combine the templates into a single prompt template
export const evaluateSolutionPromptTemplate = ChatPromptTemplate.fromMessages([
  systemPromptTemplate,
  humanPromptTemplate,
  new MessagesPlaceholder("solutionImage"),
]);

export type EvaluateSolutionInput = {
  problemId: string;
  studentAssignmentId: string;
  exerciseText: string;
  solutionImage: string;
  referenceSolution: string;
  language: Language;
  canvas: Canvas;
};

// Function to evaluate the solution using the multimodal LLM
export async function evaluateSolution(
  input: EvaluateSolutionInput,
  llmAdapter: LLMAdapter,
): Promise<z.infer<typeof EvaluateSolutionSchema>> {
  const {
    problemId,
    exerciseText,
    solutionImage,
    referenceSolution,
    studentAssignmentId,
    language,
  } = input;

  const prompt = await llmAdapter.hub.pull("evaluate_solution");
  const response = await prompt
    .pipe(llmAdapter.models.model.withStructuredOutput(EvaluateSolutionSchema))
    .invoke(
      {
        exerciseText,
        referenceSolution,
        language: LanguageName[language],
        solutionImage: new HumanMessage({
          content: [
            {
              type: "image_url",
              image_url: {
                url: solutionImage,
                detail: "high",
              },
            },
          ],
        }),
      },
      {
        metadata: {
          functionName: "evaluateSolution",
          problemId,
          studentAssignmentId,
        },
      },
    );

  return response;
}
