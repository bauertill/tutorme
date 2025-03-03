import { type Concept } from "@/core/concept/types";
import { Problem } from "@/core/problem/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { model } from "../model";

export const CREATE_LESSON_ITERATION_SYSTEM_PROMPT = `
You are an expert educational AI that creates bite-sized, incremental learning experiences for students.

Your task is to create the next lesson in a personalized lesson sequence.

Each lesson is focussed on solving one exercise problem. You are given this problem as well as the solution. 
Your goal is to come up with lesson text which explains the concepts that are necessary for solving the problem. 

Your lesson should be brief and take no more than 2 minutes to read.
`;

export const CREATE_LESSON_ITERATION_HUMAN_TEMPLATE = `
I need to create the next lesson iteration for a student learning about:

Concept: {conceptName}
Concept Description: {conceptDescription}

Trying to solve the following problem. 
Problem: {problem}
Solution: {solution}

DO NOT disclose the solution to the user. 
`;

/**
 * Creates the first iteration of a lesson
 * @param concept The concept to create a lesson for
 * @param userId The ID of the user
 * @returns The first lesson iteration with explanation and exercise
 */
export async function createLessonFromProblem(
  concept: Concept,
  problem: Problem,
  userId: string,
): Promise<string> {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      CREATE_LESSON_ITERATION_SYSTEM_PROMPT,
    ),
    HumanMessagePromptTemplate.fromTemplate(
      CREATE_LESSON_ITERATION_HUMAN_TEMPLATE,
    ),
  ]);

  const chain = promptTemplate.pipe(model).withConfig({
    tags: ["lesson-iteration-generation"],
    runName: "Generate Lesson Iteration",
  });

  const response = await chain.invoke(
    {
      conceptName: concept.name,
      conceptDescription: concept.description,
      problem: problem.problem,
      solution: problem.solution,
    },
    {
      metadata: {
        conceptId: concept.id,
        userId,
      },
    },
  );
  const lessonContent =
    response.content instanceof Object
      ? JSON.stringify(response.content)
      : String(response.content).trim();
  return lessonContent;
}
