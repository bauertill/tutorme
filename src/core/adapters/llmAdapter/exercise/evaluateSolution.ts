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
});

// Define the system prompt for evaluating exercise solutions
const EVALUATE_SOLUTION_SYSTEM_PROMPT = `You are an expert teacher evaluating a student's solution attempt to an exercise. 
You will be given the exercise text and an image of the student's handwritten or drawn (partial) solution attempt.

- Write down the student's solution verbatim as seen in the image. Discard anything that the student has crossed out.
- Analyze each step of the student's solution attempt and interpret what the student is trying to do. Identify any mistakes or misconceptions.
- If there are mistakes or the solution is incomplete, write down a hint to help the student correct the mistakes.

Keep your output concise.
`;

// Function to evaluate the solution using the multimodal LLM
export async function evaluateSolution(
  exerciseText: string,
  solutionImage: string,
): Promise<z.infer<typeof schema>> {
  // Extract the base64 data part (remove the prefix if it exists)
  const base64Data = solutionImage.includes("base64,")
    ? solutionImage.split("base64,")[1]
    : solutionImage;

  // Create messages for the LLM
  const messages = [
    new SystemMessage(EVALUATE_SOLUTION_SYSTEM_PROMPT),
    new HumanMessage({
      content: [
        {
          type: "text",
          text: `\
For the following exercise:\n\n${exerciseText}\n\nHere is the student's (partial) solution attempt:`,
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
  const response = await model.withStructuredOutput(schema).invoke(messages);

  return response;
}
