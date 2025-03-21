import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { model } from "../model";
const EXTRACT_PROBLEMS_FROM_MARKDOWN_PROMPT = `You are an AI assistant that translates an image of math problems into a list of problems. 
Go through the image and extract all the problems. Problems might be nested, in this case you should flatten the data structure and reformulate the problems so they are standalone.
Also come up with a title for the assignment.

For example when given:
# EXERCISE 2 \n
'(a) Consider the numbers 24 and 504 .\n' +
'(1) Write both numbers as a product of primes.\n' +
'(2) Write \\( \\frac{24}{504} \\) in decimal form.\n' +

Your response should be:
[
    {
        "problemText": "Consider the numbers 24 and 504. Write both numbers as a product of primes.",
        "problemNumber": "Exercise 2 (a) (1)"
    },
    {
        "problemText": "Write \\( \\frac{24}{504} \\) in decimal form." ,
        "problemNumber": "Exercise 2 (a) (2)"
    }   
]

Write your response in German language only.
`;

const RawProblem = z.object({
  problemText: z
    .string()
    .describe("The text of the problem, formatted as LaTeX"),
  problemNumber: z.string().describe("The number of the problem"),
});

type RawProblem = z.infer<typeof RawProblem>;
const RawAssignment = z.object({
  assignmentTitle: z.string().describe("The title of the assignment"),
  problems: z.array(RawProblem),
});
type RawAssignment = z.infer<typeof RawAssignment>;

export async function extractAssignmentFromImage(
  documentUrl: string,
  userId?: string,
): Promise<{ assignmentTitle: string; problems: RawProblem[] }> {
  const rawAssignment = await model.withStructuredOutput(RawAssignment).invoke(
    [
      new SystemMessage(EXTRACT_PROBLEMS_FROM_MARKDOWN_PROMPT),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: "Here is the image of the problems:",
          },
          {
            type: "image_url",
            image_url: { url: documentUrl, detail: "high" },
          },
        ],
      }),
    ],
    {
      metadata: {
        userId,
        documentUrl,
      },
    },
  );
  return rawAssignment;
}
