import { type Concept } from "@/core/concept/types";
import { type Goal } from "@/core/goal/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import assert from "assert";
import { differenceBy } from "lodash-es";
import { Allow, parse } from "partial-json";
import { z } from "zod";
import { model } from "../model";

export const SYSTEM_PROMPT = `You are an expert at breaking down learning goals into fundamental concepts.
When given a learning goal, analyze it and break it down into a list of core concepts that need to be understood.
You must respond with a JSON object containing an array of concepts.
Each concept must have a name and description field.

Example response format:
{{
  "concepts": [
    {{
      "name": "Example Concept",
      "description": "A brief description of the concept"
    }}
  ]
}}

Be concise and clear in your descriptions.`;

export const HUMAN_TEMPLATE = `Please break down the following learning goal into core concepts:
{goal}`;

export async function* generateConceptsForGoal(
  goal: Goal,
): AsyncIterable<Concept> {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT),
    HumanMessagePromptTemplate.fromTemplate(HUMAN_TEMPLATE),
  ]);

  const schema = z.object({
    concepts: z.array(
      z.object({
        name: z.string().describe("The name of the concept"),
        description: z.string().describe("A description of the concept"),
      }),
    ),
  });

  const chain = promptTemplate
    .pipe(
      model.bind({
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "concepts",
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
      goal: goal.name,
    },
    {
      metadata: {
        goalId: goal.id,
        userId: goal.userId,
      },
    },
  );

  let partialResult = "";
  let partialParsed: z.infer<typeof schema> = { concepts: [] };
  for await (const chunk of stream) {
    assert(typeof chunk.content === "string");
    partialResult += chunk.content;
    try {
      const parsed = schema.parse(
        parse(partialResult, Allow.ARR | Allow.OBJ) as unknown,
      );
      const newConcepts = differenceBy(
        parsed.concepts,
        partialParsed?.concepts ?? [],
        "name",
      );
      for (const concept of newConcepts) {
        yield {
          id: crypto.randomUUID(),
          name: concept.name,
          description: concept.description,
          goalId: goal.id,
          masteryLevel: "UNKNOWN",
          teacherReport: null,
          generationStatus: "GENERATING",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      partialParsed = parsed;
    } catch {}
  }
}
