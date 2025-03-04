import { type Concept } from "@/core/concept/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "../model";

const SYSTEM_PROMPT = `You are an expert educational AI that creates practice exercises for students.
Your task is to generate a series of exercises for a given concept at different difficulty levels.

For each difficulty level, create 10 exercises that:
1. Are specifically tailored to test understanding of the concept
2. Progress in complexity within each level
3. Include a clear solution for each exercise
4. Are practical and applicable to real-world scenarios when possible

The exercises should follow this progression:
- Beginner: Basic understanding and application of the concept
- Intermediate: More complex applications and edge cases
- Advanced: Deep understanding, complex problem-solving, and integration with other concepts

Each exercise should be self-contained and include all necessary context.`;

const HUMAN_TEMPLATE = `Please create exercises for the following concept:

Concept Name: {conceptName}
Concept Description: {conceptDescription}

Generate:
- 10 beginner exercises
- 10 intermediate exercises
- 10 advanced exercises

Format your response as a JSON object with the exercises grouped by level.`;

const Exercise = z.object({
  problem: z.string(),
  solution: z.string(),
});

const ExerciseSet = z.object({
  beginner: z.array(Exercise),
  intermediate: z.array(Exercise),
  advanced: z.array(Exercise),
});

export type Exercise = z.infer<typeof Exercise>;
export type ExerciseSet = z.infer<typeof ExerciseSet>;

export async function createDummyExercises(
  concept: Concept,
  userId: string,
): Promise<ExerciseSet> {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT),
    HumanMessagePromptTemplate.fromTemplate(HUMAN_TEMPLATE),
  ]);

  const chain = promptTemplate
    .pipe(model.withStructuredOutput(ExerciseSet))
    .withConfig({
      tags: ["exercise-generation"],
      runName: "Generate Practice Exercises",
    });

  return await chain.invoke(
    {
      conceptName: concept.name,
      conceptDescription: concept.description,
    },
    {
      metadata: {
        userId,
        conceptId: concept.id,
      },
    },
  );
}
