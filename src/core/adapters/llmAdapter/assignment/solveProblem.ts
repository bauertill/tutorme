import { type Language, LanguageName } from "@/i18n/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import * as hub from "langchain/hub";
import { z } from "zod";
import { reasoningModel } from "../model";

// Define the system prompt template
const systemPromptTemplate = SystemMessagePromptTemplate.fromTemplate(
  `You are an expert teacher creating a sample solution to an exercise. This is to be used as a reference by evaluators who are checking if a student's solution is correct.

- Write down each step that a student would need to take to solve the problem.
- For each step, write down alternatives that would also be correct.
- Also note which steps could be skipped or how the student could get to the solution more quickly.
- Note any potential pitfalls or hurdles that a student might encounter and how to overcome them.

Write your response in {language} language only.`,
  {
    name: "solve_problem_system_prompt",
  },
);

// Define the human message template
const humanPromptTemplate = HumanMessagePromptTemplate.fromTemplate(
  `Exercise:

{exerciseText}`,
  {
    name: "solve_problem_human_prompt",
  },
);

// Combine the templates into a single prompt template
export const solveProblemPromptTemplate = ChatPromptTemplate.fromMessages([
  systemPromptTemplate,
  humanPromptTemplate,
]);

// Define the output schema
export const SolutionSchema = z.object({
  solution: z
    .string()
    .describe("A detailed step-by-step solution to the problem"),
});

export async function solveProblem(
  exerciseText: string,
  language: Language,
): Promise<string> {
  // Use hub to pull the prompt
  const prompt = await hub.pull("solve_problem");

  const response = await prompt.pipe(reasoningModel).invoke(
    {
      language: LanguageName[language],
      exerciseText,
      reasoning_effort: "high",
    },
    {
      metadata: {
        functionName: "solveProblem",
      },
    },
  );

  return response.content as string;
}
