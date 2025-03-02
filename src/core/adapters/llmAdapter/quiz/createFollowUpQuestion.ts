import {
  type Concept,
  QuestionParams,
  type QuestionResponseWithQuestion,
} from "@/core/concept/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { model } from "../model";
import { retryUntilValid } from "./utils";

export const FOLLOW_UP_QUESTION_SYSTEM_PROMPT = `You are an expert educational assessor who specializes in adaptive testing.
Your task is to generate a single follow-up question that helps determine the student's true mastery level of a concept.

You will receive:
1. The concept being tested
2. Previous questions asked
3. The student's responses and whether they were correct

Rules for generating the follow-up question:
- Never repeat a previously asked question
- Adjust difficulty based on previous performance:
  * If they're succeeding at the current level, increase difficulty
  * If they're struggling, decrease difficulty
  * If performance is mixed, maintain current difficulty but test different aspects
- Focus on areas not yet covered by previous questions
- Each new question should help narrow down the student's true mastery level

The question must be multiple choice with 4 options and include:
- question text
- options array
- correct answer
- difficulty level (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- explanation for the correct answer

Response format:
{{
  "question": "What is X?",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": "Option 1",
  "difficulty": "INTERMEDIATE",
  "explanation": "Option 1 is correct because..."
}}`;
export const FOLLOW_UP_QUESTION_HUMAN_TEMPLATE = `Generate a follow-up question for:
Concept: {conceptName}
Description: {conceptDescription}

Previous Questions and Responses:
{previousQuestionsAndResponses}

Current estimated mastery level: {currentMasteryLevel}`;

export async function createFollowUpQuestion(
  concept: Concept,
  userResponses: QuestionResponseWithQuestion[],
): Promise<QuestionParams> {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(FOLLOW_UP_QUESTION_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.fromTemplate(FOLLOW_UP_QUESTION_HUMAN_TEMPLATE),
  ]);

  const chain = promptTemplate
    .pipe(model.withStructuredOutput(QuestionParams))
    .withConfig({
      tags: ["concept-evaluation"],
      runName: "Generate Concept Quiz",
    });

  const previousQuestionsAndResponses = userResponses.map(
    (response) =>
      `question: ${response.question.question}\nresponse: ${response.answer}\n isCorrect: ${response.isCorrect}`,
  );
  return retryUntilValid(() =>
    chain.invoke(
      {
        conceptName: concept.name,
        conceptDescription: concept.description,
        previousQuestionsAndResponses,
        currentMasteryLevel: concept.masteryLevel,
      },
      {
        metadata: {
          conceptId: concept.id,
          userId: userResponses[0]?.userId,
        },
      },
    ),
  );
}
