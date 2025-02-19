import { Concept, Goal } from "../goal/types";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { Question, QuizSchema } from "../concept/types";

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

export class LLMAdapter {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.7,
    });
  }

  async getConceptsForGoal(goal: Goal): Promise<Concept[]> {
    try {
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
      const concepts: Concept[] = response.concepts.map(
        (concept: ParsedConcept, index: number) => ({
          id: crypto.randomUUID(),
          name: concept.name,
          description: concept.description,
          goalId: goal.id,
          masteryLevel: "unknown",
        })
      );

      return concepts;
    } catch (error) {
      console.error("Error extracting concepts:", error);
      return [];
    }
  }

  async createKnowledgeQuiz(concept: Concept): Promise<Question[]> {
    const EVALUATION_SYSTEM_PROMPT = `You are an expert at creating educational assessments.
Given a concept, create a short quiz with questions of increasing difficulty to evaluate a user's understanding.
Generate 3 questions: one beginner level, one intermediate level, and one advanced level.
Each question should be multiple choice with 4 options.
Include an explanation for the correct answer.

You must respond with a JSON object containing an array of questions.
Each question must have: question text, options array, correct answer, difficulty level, and explanation.

Example response format:
{{
  "questions": [
    {{
      "question": "What is X?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "difficulty": "beginner",
      "explanation": "A is correct because..."
    }}
  ]
}}

Make sure questions truly reflect their difficulty level and test deep understanding at advanced levels.`;

    const EVALUATION_HUMAN_TEMPLATE = `Please create a quiz to evaluate understanding of the following concept:
Name: {conceptName}
Description: {conceptDescription}`;
    const evaluationPromptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(EVALUATION_SYSTEM_PROMPT),
      HumanMessagePromptTemplate.fromTemplate(EVALUATION_HUMAN_TEMPLATE),
    ]);
    const quizOutputParser = new JsonOutputParser<QuizSchema>();
    const evaluationChain = evaluationPromptTemplate

      .pipe(this.model)
      .pipe(quizOutputParser)
      .withConfig({
        tags: ["concept-evaluation"],
        runName: "Generate Concept Quiz",
      });
    try {
      const response = await evaluationChain.invoke(
        {
          conceptName: concept.name,
          conceptDescription: concept.description,
        },
        {
          metadata: {
            conceptId: concept.id,
          },
        }
      );

      return response.questions.map(question => ({
        ...question,
        id: crypto.randomUUID(),
      }));
    } catch (error) {
      console.error("Error generating concept evaluation:", error);
      throw new Error("Failed to generate concept evaluation");
    }
  }
}
