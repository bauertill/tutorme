import { type Concept } from "@/core/concept/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "../model";

export const CREATE_LESSON_GOAL_SYSTEM_PROMPT = `You are an expert educational content designer specializing in creating focused, achievable learning goals.

Your task is to identify the SINGLE most important learning goal for a student based on a concept and any existing teacher feedback.

Follow these guidelines:
1. Analyze the concept description and teacher's report (if available)
2. Identify knowledge gaps or areas that need the most focus
3. Create ONE clear, specific, and actionable learning goal
4. The goal should be achievable in a single lesson
5. Focus on fundamental understanding rather than advanced applications
6. Tailor the goal to the student's current level of understanding
7. The goal should be concise (ideally 10-20 words)
8. The goal should be achievable in 5-10 minutes of focused learning
9. IMPORTANT: Avoid repeating previous lesson goals - create something NEW and DIFFERENT

Your output should be a single string containing only the lesson goal.`;

export const CREATE_LESSON_GOAL_HUMAN_TEMPLATE = `Create a focused lesson goal for the concept: {conceptName}

Concept Description: {conceptDescription}

Teacher's Report (previous assessments): {teacherReport}

Previous lesson goals for this concept: {previousLessonGoals}

Provide a single, clear lesson goal that addresses the most important aspect of this concept for the student to learn. Your goal MUST be different from any previous goals.

Also provide a short exercise that reinforces the lesson goal and is in line with the concept name and description as well as the teacher's report.
DO NOT make the exercise too easy or too hard.

Output format:
{{
  "lessonGoal": "string",
  "exercise": "string"
}}
`;

const LessonGoalAndDummyExercise = z.object({
  lessonGoal: z.string(),
  exercise: z.string(),
});
export type LessonGoalAndDummyExercise = z.infer<
  typeof LessonGoalAndDummyExercise
>;

/**
 * Creates a focused lesson goal based on the concept and teacher's report
 * @param concept The concept to create a lesson goal for
 * @param userId The ID of the user
 * @param previousLessonGoals Previous lesson goals to avoid repetition
 * @returns A focused lesson goal as a string
 */
export async function createLessonGoalAndDummyExercise(
  concept: Concept,
  userId: string,
  previousLessonGoals: string[] = [],
): Promise<LessonGoalAndDummyExercise> {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(CREATE_LESSON_GOAL_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.fromTemplate(CREATE_LESSON_GOAL_HUMAN_TEMPLATE),
  ]);

  const chain = promptTemplate
    .pipe(model.withStructuredOutput(LessonGoalAndDummyExercise))
    .withConfig({
      tags: ["lesson-goal-generation"],
      runName: "Generate Lesson Goal",
    });

  return await chain.invoke(
    {
      conceptName: concept.name,
      conceptDescription: concept.description,
      teacherReport:
        concept.teacherReport ?? "No previous assessments available.",
      previousLessonGoals:
        previousLessonGoals.length > 0
          ? JSON.stringify(previousLessonGoals)
          : "No previous lesson goals available.",
    },
    {
      metadata: {
        conceptId: concept.id,
        userId,
      },
    },
  );
}
