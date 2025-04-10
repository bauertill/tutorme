import { type Language, LanguageName } from "@/i18n/types";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { reasoningModel } from "../model";

const SOLVE_PROBLEM_SYSTEM_PROMPT = (language: Language) => `\
You are an expert teacher creating a sample solution to an exercise. This is to be used as a reference by evaluators who are checking if a student's solution is correct.

- Write down each step that a student would need to take to solve the problem.
- For each step, write down alternatives that would also be correct.
- Also note which steps could be skipped or how the student could get to the solution more quickly.
- Note any potential pitfalls or hurdles that a student might encounter and how to overcome them.

Write your response in ${LanguageName[language]} language only.
`;

export async function solveProblem(
  exerciseText: string,
  language: Language,
): Promise<string> {
  const messages = [
    new SystemMessage(SOLVE_PROBLEM_SYSTEM_PROMPT(language)),
    new HumanMessage({
      content: [
        {
          type: "text",
          text: `\
Exercise:

${exerciseText}`,
        },
      ],
    }),
  ];

  const response = await reasoningModel.invoke(messages, {
    reasoning_effort: "high",
    metadata: {
      functionName: "solveProblem",
    },
  });
  return response.content as string;
}
