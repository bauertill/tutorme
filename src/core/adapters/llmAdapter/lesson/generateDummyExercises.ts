import { type Concept } from "@/core/concept/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import assert from "assert";
import { differenceBy } from "lodash-es";
import { Allow, parse } from "partial-json";
import { z } from "zod";
import { fastModel } from "../model";


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

`


const Exercise = z.object({
  problem: z.string(),
  solution: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});
export type Exercise = z.infer<typeof Exercise>;

export async function* generateDummyExercisesForConcept(
  concept: Concept,
  userId: string,
): AsyncIterable<Exercise> {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT),
    HumanMessagePromptTemplate.fromTemplate(HUMAN_TEMPLATE),
  ]);

  const schema = z.object({
    exercises: z.array(Exercise),
  });
  const chain = promptTemplate
    .pipe(
      fastModel.bind({
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "exercises",
            schema: schema,
          },
        },
      }),
    )
    .withConfig({
      tags: ["concept-extraction"],
      runName: "Extract Learning Concepts",
    });
  const stream = await chain.stream(
    {
      conceptName: concept.name,
      conceptDescription: concept.description,
    },
    {
      metadata: {
        conceptId: concept.id,
        userId,
      },
    },
  );

  let partialResult = "";
  let partialParsed: z.infer<typeof schema> = { exercises: [] };
  for await (const chunk of stream) {
    assert(typeof chunk.content === "string");
    partialResult += chunk.content;
    try {
      const parsed = schema.parse(
        parse(partialResult, Allow.ARR) as unknown,
      );
      const newExercises = differenceBy(
        parsed.exercises,
        partialParsed.exercises,
        "problem",
      );
      for (const exercise of newExercises) {
        yield {
          problem: exercise.problem,
          solution: exercise.solution,
          difficulty: exercise.difficulty,
        };
      }
      partialParsed = parsed;
    } catch {}
  }
}
