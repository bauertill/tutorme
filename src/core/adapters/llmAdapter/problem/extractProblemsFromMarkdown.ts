import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "../model";
export const EXTRACT_PROBLEMS_FROM_MARKDOWN_PROMPT = `You are an AI assistant that translates a markdown document into a list of problems. 
Go through the markdown document and extract all the problems. Problems might be nested, in this case you should flatten the data structure and reformulate the problems so they are standalone.

For example when given:
# EXERCISE 2 \n
'(a) Consider the numbers 24 and 504 .\n' +
'(1) Write both numbers as a product of primes.\n' +
'(2) Is 24 a factor of 504 ?\n' +
'(b) Consider the numbers 72 and 180 .\n'

Your response should be:
[
    {{
        "problemText": "Consider the numbers 24 and 504. Write both numbers as a product of primes.",
        "problemNumber": "Exercise 2 (a) (1)"
    }},
    {{
        "problemText": "Is 24 a factor of 504 ?",
        "problemNumber": "Exercise 2 (a) (2)"
    }}   
]
`;

export const EXTRACT_PROBLEMS_FROM_MARKDOWN_HUMAN_TEMPLATE = `Generate a list of problems from the following markdown document:
{markdown}
`;

export const RawProblem = z.object({
  problemText: z.string(),
  problemNumber: z.string(),
});

export type RawProblem = z.infer<typeof RawProblem>;
export const RawProblemList = z.object({
  problems: z.array(RawProblem),
});
export type RawProblemList = z.infer<typeof RawProblemList>;

/**
 * Generate a good search query for finding educational videos about a concept
 * @param concept The concept to search for videos about
 * @returns Promise with recommended search query
 */
export async function extractProblemsFromMarkdown(
  markdown: string,
  userId: string,
  documentUrl: string,
): Promise<RawProblem[]> {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      EXTRACT_PROBLEMS_FROM_MARKDOWN_PROMPT,
    ),
    HumanMessagePromptTemplate.fromTemplate(
      EXTRACT_PROBLEMS_FROM_MARKDOWN_HUMAN_TEMPLATE,
    ),
  ]);

  const chain = promptTemplate.pipe(model.withStructuredOutput(RawProblemList));
  const rawProblemList = await chain.invoke(
    {
      markdown,
    },
    {
      metadata: {
        userId,
        documentUrl,
      },
    },
  );
  return rawProblemList.problems;
}
