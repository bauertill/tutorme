import { type Concept } from "@/core/concept/types";
import { type LessonTurn } from "@/core/lesson/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "../model";

export const CREATE_LESSON_ITERATION_SYSTEM_PROMPT = `
You are an expert educational AI that creates bite-sized, incremental learning experiences for students.

Your task is to create the next iteration in a personalized lesson sequence.

Each lesson iteration consists of a brief explanation that takes no more than 2 minutes to read.
Thereafter, there is also an exercise that takes no more than 2 minutes to complete.

Important guidelines:
- Make each explanation clear, concise, and focused on ONE small aspect of the concept
- Build upon previous explanations and exercises in a logical progression
- Tailor your teaching to the student's demonstrated understanding from previous iterations
- Focus on incrementally building understanding toward the lesson goal
- For the first iteration, introduce the most fundamental aspect of the concept
- For subsequent iterations, address any misconceptions and progress toward deeper understanding
`;

export const CREATE_LESSON_ITERATION_HUMAN_TEMPLATE = `
I need to create the next lesson iteration for a student learning about:

Concept: {conceptName}
Concept Description: {conceptDescription}
Lesson Goal: {lessonGoal}


Please provide a concise explanation (2 minutes reading time) that builds on previous iterations.

After the explanation, please provide a brief exercise that reinforces the explanation.
Output format:
{{
  "explanation": "<explanation text>",
  "exercise": "<exercise text>"
}}
`;

/**
 * Creates the first iteration of a lesson
 * @param concept The concept to create a lesson for
 * @param userId The ID of the user
 * @returns The first lesson iteration with explanation and exercise
 */
export async function createLessonIteration(
  concept: Concept,
  lessonGoal: string,
  lessonTurns: LessonTurn[],
  userId: string,
): Promise<{
  explanationText: string;
  exerciseText: string;
}> {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      CREATE_LESSON_ITERATION_SYSTEM_PROMPT,
    ),
    HumanMessagePromptTemplate.fromTemplate(
      CREATE_LESSON_ITERATION_HUMAN_TEMPLATE,
    ),
  ]);

  // Define schema for structured output
  const lessonSchema = z.object({
    explanationText: z
      .string()
      .describe(
        "A clear, concise explanation of the concept targeted at the user's current understanding level. Should take no more than one minute to read.",
      ),
    exerciseText: z
      .string()
      .describe(
        "A clear, concise explanation of the concept targeted at the user's current understanding level. Should take no more than one minute to read.",
      ),
  });

  const chain = promptTemplate
    .pipe(model.withStructuredOutput(lessonSchema))
    .withConfig({
      tags: ["lesson-iteration-generation"],
      runName: "Generate Lesson Iteration",
    });

  const response = await chain.invoke(
    {
      conceptName: concept.name,
      conceptDescription: concept.description,
      lessonGoal,
    },
    {
      metadata: {
        conceptId: concept.id,
        userId,
      },
    },
  );

  return response;
}
