import { Concept, Goal } from "../goal/types";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

const ConceptSchema = z.object({
  concepts: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().min(1),
    })
  ),
});

type ConceptOutput = z.infer<typeof ConceptSchema>;
type ParsedConcept = ConceptOutput["concepts"][number];

const SYSTEM_PROMPT = `You are an expert at breaking down learning goals into fundamental concepts.
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

const HUMAN_TEMPLATE = `Please break down the following learning goal into core concepts:
{goal}`;

// @TODO add a JSON schema to the prompt to ensure the output is valid
// @TODO use a zod object to parse the output

export class LLMAdapter {
  private model: ChatOpenAI;
  private promptTemplate: ChatPromptTemplate;
  private chain: Runnable;
  private outputParser: JsonOutputParser<ConceptOutput>;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.7, 
    });

    this.promptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT),
      HumanMessagePromptTemplate.fromTemplate(HUMAN_TEMPLATE),
    ]);

    this.outputParser = new JsonOutputParser<ConceptOutput>();

    this.chain = this.promptTemplate
      .pipe(this.model)
      .pipe(this.outputParser)
      .withConfig({
        tags: ["concept-extraction"],
        runName: "Extract Learning Concepts",
      });
  }

  async getConceptsForGoal(goal: Goal): Promise<Concept[]> {
    try {
      const response = await this.chain.invoke(
        {
          goal: goal.goal,
        },
        {
          metadata: {
            goalId: goal.id,
            userId: goal.userId,
          },
        }
      );

      // Map the parsed concepts to our domain model
      const concepts: Concept[] = response.concepts.map((concept: ParsedConcept, index: number) => ({
        id: crypto.randomUUID(),
        name: concept.name,
        description: concept.description,
        goalId: goal.id,
        masteryLevel: "unknown",
      }));

      return concepts;
    } catch (error) {
      console.error("Error extracting concepts:", error);
      return [];
    }
  }
}
