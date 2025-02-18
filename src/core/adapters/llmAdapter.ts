import { Concept, Goal } from "../goal/types";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";

const SYSTEM_PROMPT = `You are an expert at breaking down learning goals into fundamental concepts.
When given a learning goal, analyze it and break it down into a list of core concepts that need to be understood.
Format each concept as follows:

name: <concept name>
description: <brief 1-2 sentence description of the concept>

Separate each concept with a blank line. Be concise and clear.`;

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

      // Split response by double newline to separate concepts
      const conceptBlocks = response.text
        .split("\n\n")
        .map(block => block.trim())
        .filter(block => block.length > 0);

      // Parse each concept block into name and description
      const concepts: Concept[] = conceptBlocks.map((block, index) => {
        const nameMatch = block.match(/name:\s*(.+)(?:\n|$)/);
        const descriptionMatch = block.match(/description:\s*(.+)(?:\n|$)/);

        return {
          id: `${goal.id}-${index}`,
          name: nameMatch?.[1]?.trim() ?? "Unknown Concept",
          description: descriptionMatch?.[1]?.trim() ?? "",
          goalId: goal.id,
          masteryLevel: "unknown",
        };
      });

      return concepts;
    } catch (error) {
      console.error("Error extracting concepts:", error);
      return [];
    }
  }
}
