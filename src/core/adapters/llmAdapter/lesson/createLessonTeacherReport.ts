import { type Concept } from "@/core/concept/types";
import { type Lesson } from "@/core/lesson/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { model } from "../model";

export const LESSON_TEACHER_REPORT_SYSTEM_PROMPT = `
You are an expert educational AI that creates detailed teacher reports after tutoring sessions.

Your task is to write a teacher report for a student who just completed a lesson on a concept. The teacher report should be about the entire concept, not just the lesson. 
To achieve this the previous teacher report is included. 

Further you are given the students responses on exercises in the lesson.
Using both the previous teacher report and the students responses on exercises, you should be able to write a comprehensive teacher report, updating the previous report with the new information.

The teacher report should:
1. Enumerate what the student understands
2. Enumerate what the student does not yet understand

Keep the report concise but be sure to update it with the latest lesson iterations. These should be weighted more heavily than the previous report.
`;

export const LESSON_TEACHER_REPORT_HUMAN_TEMPLATE = `
I need to create a teacher report for a student who just completed a lesson on:

Concept: {conceptName}
Concept Description: {conceptDescription}
Lesson Goal: {lessonGoal}

Previous Teacher Report: {previousTeacherReport}

Lesson Iterations:
{lessonIterations}

Please provide a concise teacher report that incorporates important context from the previous report (if available) and analyzes the student's progress through this lesson.
`;

/**
 * Creates a teacher report for a lesson that takes into account previous teacher reports and lesson iterations
 * @param concept The concept to create a lesson goal for
 * @param lesson The completed lesson with all iterations
 * @param userId The ID of the user
 * @returns A teacher report as a string
 */
export async function createLessonTeacherReport(
  concept: Concept,
  lesson: Lesson,
  userId: string,
): Promise<string> {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      LESSON_TEACHER_REPORT_SYSTEM_PROMPT,
    ),
    HumanMessagePromptTemplate.fromTemplate(
      LESSON_TEACHER_REPORT_HUMAN_TEMPLATE,
    ),
  ]);

  const chain = promptTemplate.pipe(model).withConfig({
    tags: ["lesson-teacher-report-generation"],
    runName: "Generate Lesson Teacher Report",
  });

  // Format lesson iterations for the prompt
  const lessonIterationsFormatted = lesson.lessonIterations.map(
    (iteration, index) => {
      const explanationTurn = iteration.turns.find(
        (turn) => turn.type === "explanation",
      );
      const exerciseTurn = iteration.turns.find(
        (turn) => turn.type === "exercise",
      );
      const userResponseTurn = iteration.turns.find(
        (turn) => turn.type === "user_input",
      );

      return {
        iterationNumber: index + 1,
        explanation: explanationTurn?.text ?? "No explanation provided",
        exercise: exerciseTurn?.text ?? "No exercise provided",
        userResponse: userResponseTurn?.text ?? "No user response provided",
        evaluation: iteration.evaluation ?? "No evaluation provided",
      };
    },
  );

  const response = await chain.invoke(
    {
      conceptName: concept.name,
      conceptDescription: concept.description,
      lessonGoal: lesson.lessonGoal,
      previousTeacherReport:
        concept.teacherReport ?? "No previous assessments available.",
      lessonIterations: JSON.stringify(lessonIterationsFormatted, null, 2),
    },
    {
      metadata: {
        conceptId: concept.id,
        lessonId: lesson.id,
        userId,
      },
    },
  );

  // Extract the teacher report from the response
  const lessonTeacherReport =
    response.content instanceof Object
      ? JSON.stringify(response.content)
      : String(response.content).trim();

  return lessonTeacherReport;
}
