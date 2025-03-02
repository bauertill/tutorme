import {
  type Concept,
  type QuestionResponseWithQuestion,
} from "@/core/concept/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "../model";

export const DECIDE_NEXT_ACTION_SYSTEM_PROMPT = `You are an expert educational assessor who specializes in adaptive testing.
Your task is to decide whether a student has demonstrated sufficient mastery of a concept to finalize the quiz or if more questions are needed.

You will receive:
1. The concept being tested
2. All questions asked so far
3. The student's responses and whether they were correct
4. Current estimated mastery level

Rules for deciding:
- Consider the student's performance across all difficulty levels
- A quiz should be finalized when:
  * The student has consistently demonstrated mastery at their current level
  * The student has reached a plateau in their performance
  * The student has answered enough questions to reliably assess their knowledge (typically 3-5 questions)
- A quiz should continue when:
  * More data is needed to accurately assess mastery
  * The student's performance is inconsistent
  * The student is showing improvement and might reach a higher mastery level

You should decide optimally to not over-assess the student and risk the student getting bored.

Response format:
{{
  "action": "continueQuiz" | "finalizeQuiz",
  "reason": "Explanation of why this action was chosen"
}}`;

export const DECIDE_NEXT_ACTION_HUMAN_TEMPLATE = `Decide the next action for:
Concept: {conceptName}
Description: {conceptDescription}

Questions and Responses:
{questionsAndResponses}

Current estimated mastery level: {currentMasteryLevel}
Number of questions answered: {questionCount}`;

/**
 * Decides whether to continue a quiz or finalize it based on user responses
 * @param concept The concept being tested
 * @param userResponses All user responses for this concept
 * @returns Promise with decision to continue or finalize quiz
 */
export async function decideNextAction(
  concept: Concept,
  userResponses: QuestionResponseWithQuestion[],
): Promise<{ action: "continueQuiz" | "finalizeQuiz"; reason: string }> {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(DECIDE_NEXT_ACTION_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.fromTemplate(DECIDE_NEXT_ACTION_HUMAN_TEMPLATE),
  ]);

  const schema = z.object({
    action: z.enum(["continueQuiz", "finalizeQuiz"]),
    reason: z.string().describe("Explanation of why this action was chosen"),
  });

  const chain = promptTemplate
    .pipe(model.withStructuredOutput(schema))
    .withConfig({
      tags: ["quiz-decision"],
      runName: "Decide Next Quiz Action",
    });

  const questionsAndResponses = userResponses.map(
    (response) =>
      `question: ${response.question.question}\ndifficulty: ${response.question.difficulty}\nresponse: ${response.answer}\nisCorrect: ${response.isCorrect}`,
  );

  return await chain.invoke(
    {
      conceptName: concept.name,
      conceptDescription: concept.description,
      questionsAndResponses,
      currentMasteryLevel: concept.masteryLevel,
      questionCount: userResponses.length,
    },
    {
      metadata: {
        conceptId: concept.id,
        userId: userResponses[0]?.userId,
      },
    },
  );
}
