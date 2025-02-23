import { JsonOutputParser } from "@langchain/core/output_parsers";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { Question } from "../concept/types";
import { type Concept, type Goal } from "../goal/types";
import { HUMAN_TEMPLATE, SYSTEM_PROMPT } from "./prompts/getConceptsForGoal";
import {
  EVALUATION_HUMAN_TEMPLATE,
  EVALUATION_SYSTEM_PROMPT,
} from "./prompts/initialKnowledgeQuiz";

type ConceptOutput = {
  concepts: Array<{
    name: string;
    description: string;
  }>;
};
type ParsedConcept = ConceptOutput["concepts"][number];

export class LLMAdapter {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.7,
    });
  }

  async getConceptsForGoal(goal: Goal): Promise<Concept[]> {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT),
      HumanMessagePromptTemplate.fromTemplate(HUMAN_TEMPLATE),
    ]);

    const outputParser = new JsonOutputParser<ConceptOutput>();

    const chain = promptTemplate
      .pipe(this.model)
      .pipe(outputParser)
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
    const concepts: Concept[] = response.concepts.map(
      (concept: ParsedConcept) => ({
        id: crypto.randomUUID(),
        name: concept.name,
        description: concept.description,
        goalId: goal.id,
        masteryLevel: "UNKNOWN",
      }),
    );
    return concepts;
  }

  async createInitialKnowledgeQuiz(
    concept: Concept,
  ): Promise<
    Pick<
      Question,
      "question" | "options" | "correctAnswer" | "difficulty" | "explanation"
    >[]
  > {
    const evaluationPromptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(EVALUATION_SYSTEM_PROMPT),
      HumanMessagePromptTemplate.fromTemplate(EVALUATION_HUMAN_TEMPLATE),
    ]);
    const quizOutputParser = new JsonOutputParser();
    const evaluationChain = evaluationPromptTemplate
      .pipe(this.model)
      .pipe(quizOutputParser)
      .withConfig({
        tags: ["concept-evaluation"],
        runName: "Generate Concept Quiz",
      });

    const response = await evaluationChain.invoke(
      {
        conceptName: concept.name,
        conceptDescription: concept.description,
      },
      {
        metadata: {
          conceptId: concept.id,
        },
      },
    );

    const questions = z
      .object({
        questions: z.array(
          Question.pick({
            question: true,
            options: true,
            correctAnswer: true,
            difficulty: true,
            explanation: true,
          }),
        ),
      })
      .parse(response).questions;

    return questions.map((question) => ({
      ...question,
      id: crypto.randomUUID(),
    }));
  }
}
