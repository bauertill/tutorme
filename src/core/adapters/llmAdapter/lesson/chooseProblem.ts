import { type Problem } from "@/core/problem/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import assert from "assert";
import { z } from "zod";
import { model } from "../model";

export const CHOOSE_PROBLEM_SYSTEM_PROMPT = `You are an expert tutor.
Your task is to choose a problem from the following list of problems.

Follow these guidelines:
1. Carefully read the lesson goal.
2. Carefully read the list of problems.
3. Choose the problem that is most relevant to the lesson goal.

Your output should be the index of the problem to choose.`;

export const CHOOSE_PROBLEM_HUMAN_TEMPLATE = `Please choose a problem from the following list of problems.

Lesson Goal: {lessonGoal}

Problems:
{problems}
`;

export async function chooseProblemForGoal(
  lessonGoal: string,
  relevantProblems: Problem[],
): Promise<Problem> {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(CHOOSE_PROBLEM_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.fromTemplate(CHOOSE_PROBLEM_HUMAN_TEMPLATE),
  ]);

  const schema = z.object({
    problemIndex: z.number().describe("The index of the problem to choose"),
  });

  const chain = promptTemplate
    .pipe(model.withStructuredOutput(schema))
    .withConfig({
      tags: ["problem-selection"],
      runName: "Select Problem",
    });

  const formattedRelevantProblems = relevantProblems.map((problem, index) => ({
    index,
    problem: `Type: ${problem.type}\nLevel: ${problem.level}\nProblem: ${problem.problem}`,
  }));

  const response = await chain.invoke(
    {
      lessonGoal,
      problems: JSON.stringify(formattedRelevantProblems, null, 2),
    },
    {
      metadata: {
        lessonGoal,
      },
    },
  );

  const chosenProblem = relevantProblems[response.problemIndex];
  assert(chosenProblem, "Chosen problem index is out of bounds");
  return chosenProblem;
}
