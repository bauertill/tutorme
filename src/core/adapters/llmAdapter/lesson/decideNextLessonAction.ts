import { type Lesson } from "@/core/lesson/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "../model";

const DECIDE_NEXT_ACTION_SYSTEM_PROMPT = `You are an expert tutor evaluating a student's progress and deciding on the next appropriate action.

Your task is to analyze the student's response and determine the most appropriate next step in their learning journey.

Follow these guidelines:
1. If the student's response is correct return "end_lesson"
2. If the student shows understanding but needs guidance, return "give_hint" with a helpful hint
   To create the hint, read through the transcript of the lesson so far and the student's response.
   Create a hint that addresses the student's misunderstanding and guides them towards the correct answer.
3. If the student appears completely lost or shows fundamental misunderstandings, return "pause_lesson"

Your evaluation should be constructive and aimed at helping the student succeed.`;

const DECIDE_NEXT_ACTION_HUMAN_TEMPLATE = `Please evaluate the student's progress and decide the next action.

Lesson Goal: {lessonGoal}

Exercise given to student: 
"""
{exercise}
"""

Exercise Solution:
"""
{solution}
"""


Transcript of the lesson so far:
"""
{transcript}
"""

Student's Response:
"""
{userInput}
"""

Provide your decision in JSON format with the following structure:
{{
  "action": "end_lesson" | "give_hint" | "pause_lesson",
  "hint": "helpful hint text" // Only required if action is "give_hint"
}}`;

// Define the schema for structured output
const nextLessonAction = z.object({
  action: z.enum(["end_lesson", "give_hint", "pause_lesson"]),
  hint: z.string().optional().describe("A helpful hint to guide the student"),
});

export type NextLessonAction =
  | { action: "end_lesson" }
  | { action: "give_hint"; hint: string }
  | { action: "pause_lesson" };

/**
 * Decides the next action to take in a lesson based on the user's response
 * @param lesson The current lesson
 * @param userInput The user's response to the exercise
 * @returns The next action to take (end_lesson, give_hint with hint text, or pause_lesson)
 */
export async function decideNextLessonAction(
  lesson: Lesson,
  userInput: string,
): Promise<NextLessonAction> {
  // Get the exercise turn from the lesson
  const exerciseTurn = lesson.turns.find((turn) => turn.type === "exercise");

  if (!exerciseTurn) {
    throw new Error("No exercise found in lesson turns");
  }
  const transcript = lesson.turns
    .map((turn) => `${turn.type}: ${turn.text}`)
    .join("\n\n");

  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(DECIDE_NEXT_ACTION_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.fromTemplate(DECIDE_NEXT_ACTION_HUMAN_TEMPLATE),
  ]);

  const chain = promptTemplate
    .pipe(model.withStructuredOutput(nextLessonAction))
    .withConfig({
      tags: ["lesson-action-decision"],
      runName: "Decide Next Lesson Action",
    });

  const response = await chain.invoke(
    {
      lessonGoal: lesson.lessonGoal,
      exercise: exerciseTurn.text,
      solution: exerciseTurn.solution,
      transcript,
      userInput,
    },
    {
      metadata: {
        lessonId: lesson.id,
        userId: lesson.userId,
      },
    },
  );

  // Transform the response to match our NextLessonAction type
  if (response.action === "give_hint") {
    if (!response.hint)
      throw new Error("No hint provided with give_hint action");
    return { action: "give_hint", hint: response.hint };
  } else if (response.action === "end_lesson") {
    return { action: "end_lesson" };
  } else {
    return { action: "pause_lesson" };
  }
}
