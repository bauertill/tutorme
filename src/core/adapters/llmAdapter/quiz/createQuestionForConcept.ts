import { type Concept, QuestionParams } from "@/core/concept/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { model } from "../model";
import { retryUntilValid } from "./utils";

export const EVALUATION_SYSTEM_PROMPT = `You are an expert at creating educational assessments.
Given a concept, create a single question to evaluate a user's understanding.
The question should be multiple choice with 4 options.
Include an explanation for the correct answer.

You must respond with a JSON object containing a single question.
The question must have: question text, options array, correct answer, difficulty level, and explanation.

Example response format:
{{
  "question": "What is X?",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": "Option 1",
  "difficulty": "BEGINNER",
  "explanation": "Option 1 is correct because..."
}}

The difficulty level should be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
- BEGINNER questions test basic concepts
- INTERMEDIATE questions test application and understanding
- ADVANCED questions test complex scenarios and interconnected concepts
- EXPERT questions test edge cases and mastery of the subject`;

export const EVALUATION_HUMAN_TEMPLATE = `Please create a quiz to evaluate understanding of the following concept:
Name: {conceptName}
Description: {conceptDescription}`;

export async function createQuestionForConcept(
  concept: Concept,
): Promise<QuestionParams> {
  const evaluationPromptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(EVALUATION_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.fromTemplate(EVALUATION_HUMAN_TEMPLATE),
  ]);
  const evaluationChain = evaluationPromptTemplate
    .pipe(model.withStructuredOutput(QuestionParams))
    .withConfig({
      tags: ["concept-evaluation"],
      runName: "Generate Concept Quiz",
    });

  return retryUntilValid(() =>
    evaluationChain.invoke(
      {
        conceptName: concept.name,
        conceptDescription: concept.description,
      },
      {
        metadata: {
          conceptId: concept.id,
        },
      },
    ),
  );
}
