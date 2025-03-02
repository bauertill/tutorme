import { type Concept } from "@/core/concept/types";
import { type Goal } from "@/core/goal/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
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

export async function getConceptsForGoal(goal: Goal): Promise<Concept[]> {
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
    .pipe(model.withStructuredOutput(schema))
    .withConfig({
      tags: ["concept-extraction"],
      runName: "Extract Learning Concepts",
    });
  const response = await chain.invoke(
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

  // Map the parsed concepts to our domain model
  const concepts: Concept[] = response.concepts.map((concept) => ({
    id: crypto.randomUUID(),
    name: concept.name,
    description: concept.description,
    goalId: goal.id,
    masteryLevel: "UNKNOWN",
    teacherReport: null,
  }));
  return concepts;
}
