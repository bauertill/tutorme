import { Concept, Goal } from "../goal/types";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";

const SYSTEM_PROMPT = `You are an expert at breaking down learning goals into fundamental concepts.
When given a learning goal, analyze it and break it down into a list of core concepts that need to be understood.
Return only the list of concepts, one per line.`;

const HUMAN_TEMPLATE = `Please break down the following learning goal into core concepts:
{goal}`;

export class LLMAdapter {
  private model: ChatOpenAI;
  private promptTemplate: ChatPromptTemplate;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 1,
    });

    this.promptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT),
      HumanMessagePromptTemplate.fromTemplate(HUMAN_TEMPLATE),
    ]);
  }

  async getConceptsForGoal(goal: Goal): Promise<Concept[]> {
    try {
      // Create the chain with system prompt
      const chain = this.promptTemplate.pipe(this.model);

      const response = await chain.invoke({
        goal: goal.goal,
      });

      const conceptNames = response.text
        .split("\n")
        .map(concept => concept.trim())
        .filter(concept => concept.length > 0);

      // Convert concept names into Concept objects with generated IDs
      const concepts: Concept[] = conceptNames.map((name, index) => ({
        id: `${goal.id}-${index}`,
        name: name,
        goalId: goal.id,
        description: "",
        masteryLevel: "unknown",
      }));

      return concepts;
    } catch (error) {
      console.error("Error extracting concepts:", error);
      return [];
    }
  }
}
