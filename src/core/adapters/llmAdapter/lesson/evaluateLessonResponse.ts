import { type Lesson, type LessonTurn } from "@/core/lesson/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "../model";

export const EVALUATE_LESSON_RESPONSE_SYSTEM_PROMPT = `You are an expert tutor evaluating a student's response to a learning exercise.
Your task is to assess if the student has achieved the lesson goal based on their response to the exercise.

Follow these guidelines:
1. Carefully read the lesson goal, explanation, exercise, and student response.
2. Evaluate whether the student's response demonstrates understanding of the concept.
3. Your response MUST include a clear boolean judgment (isComplete: true/false) indicating whether the student has achieved the lesson goal.
4. If the goal was achieved (isComplete: true), provide a brief explanation of why the student's understanding is sufficient.
5. If the goal was not achieved (isComplete: false), provide a constructive evaluation that:
   - Identifies specific areas of misunderstanding
   - Points out any misconceptions
   - Suggests what concepts need further review
6. Keep your evaluation concise, clear, and actionable.

Your evaluation should help guide the student's further learning and must be formatted as a JSON object with 'isComplete' and 'feedback' fields.`;

export const EVALUATE_LESSON_RESPONSE_HUMAN_TEMPLATE = `Please evaluate the student's response to this lesson exercise.

Lesson Goal: {lessonGoal}

Explanation provided to student: 
"""
{explanation}
"""

Exercise given to student: 
"""
{exercise}
"""

Exercise Sample Solution:
"""
{exerciseSolution}
"""

Student's Response:
"""
{userInput}
"""

Provide your evaluation in JSON format with the following structure:
{{
  "isComplete": boolean, // true if the lesson goal was achieved, false otherwise
  "feedback": "your detailed feedback here"
}}`;

/**
 * Evaluates a user's response to a lesson exercise and creates a new lesson iteration
 * @param lesson The current lesson
 * @param userInput The user's response to the exercise
 * @returns Evaluation result with feedback and completion status
 */
export async function evaluateLessonResponse(
  lesson: Lesson,
  userInput: string,
): Promise<{ evaluation: string; isComplete: boolean }> {
  // Get the last iteration from the lesson
  if (lesson.turns.length === 0) {
    throw new Error("Lesson has no iterations");
  }

  // Find the explanation and exercise turns in the last iteration
  const explanationTurn = lesson.turns.find(
    (turn: LessonTurn) => turn.type === "explanation",
  )!;
  const exerciseTurn = lesson.turns.find(
    (turn: LessonTurn) => turn.type === "exercise",
  )!;

  if (!explanationTurn || !exerciseTurn) {
    throw new Error(
      "Last iteration does not contain both explanation and exercise turns",
    );
  }

  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      EVALUATE_LESSON_RESPONSE_SYSTEM_PROMPT,
    ),
    HumanMessagePromptTemplate.fromTemplate(
      EVALUATE_LESSON_RESPONSE_HUMAN_TEMPLATE,
    ),
  ]);

  // Define the schema for structured output
  const evaluationSchema = z.object({
    isComplete: z
      .boolean()
      .describe("Whether the student has achieved the lesson goal"),
    feedback: z
      .string()
      .describe("Detailed feedback on the student's response"),
  });

  const chain = promptTemplate
    .pipe(model.withStructuredOutput(evaluationSchema))
    .withConfig({
      tags: ["lesson-evaluation"],
      runName: "Evaluate Lesson Response",
    });

  const response = await chain.invoke(
    {
      lessonGoal: lesson.lessonGoal,
      explanation: explanationTurn.text,
      exercise: exerciseTurn.text,
      exerciseSolution: exerciseTurn.solution,
      userInput,
    },
    {
      metadata: {
        lessonId: lesson.id,
        userId: lesson.userId,
      },
    },
  );
  console.log("REPSONSE FORM THE LLM", response);

  return {
    evaluation: response.feedback,
    isComplete: response.isComplete,
  };
}
