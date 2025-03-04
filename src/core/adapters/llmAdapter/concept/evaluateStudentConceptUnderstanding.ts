import { MasteryLevel, type Concept } from "@/core/concept/types";
import { Lesson, LessonStatus } from "@/core/lesson/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "../model";

export const SYSTEM_PROMPT = `You are an expert at assessing student understanding of a concept.
You will be given a concept and a list of lessons that the student has completed.
Each lesson contains a list of turns. The goal of the lesson is for the student to correctly complete the exercise.
You will be given a list of problems that the student has attempted as well as if they got it 
correct,
correct with the help of some hints,
the exercise was abandoned

Using both the previous teacher report and the students responses on exercises,
you should be able to write a comprehensive teacher report, updating the previous report with the new information.

The teacher report:
1. Enumerate what the student understands
2. Enumerate what the student does not yet understand

Keep the report concise but be sure to update it with the latest lesson iterations. These should be weighted more heavily than the previous report.

Example response format:
{{
    "teacherReport": "",
    "masteryLevel": "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"
}}
`;

export const HUMAN_TEMPLATE = `
Please write a teacherReport as well as choose a masteryLevel for the following 
concept: {conceptName}
description: {conceptDescription}

previousTeacherReport: {previousTeacherReport}

exerciseResults: {exerciseResults}
`;

export async function evaluateStudentConceptUnderstanding(
  concept: Concept,
  lessons: Lesson[],
  userId: string,
): Promise<{ teacherReport: string; masteryLevel: MasteryLevel }> {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT),
    HumanMessagePromptTemplate.fromTemplate(HUMAN_TEMPLATE),
  ]);

  const schema = z.object({
    teacherReport: z.string().describe("The teacher report"),
    masteryLevel: MasteryLevel,
  });

  const chain = promptTemplate
    .pipe(model.withStructuredOutput(schema))
    .withConfig({
      tags: ["concept-evaluation"],
      runName: "Evaluate Student Concept Understanding",
    });

  return await chain.invoke(
    {
      conceptName: concept.name,
      conceptDescription: concept.description,
      previousTeacherReport: concept.teacherReport,
      exerciseResults: getExerciseResults(lessons),
    },
    {
      metadata: {
        userId,
        conceptId: concept.id,
      },
    },
  );
}

function getExerciseResults(lessons: Lesson[]): string {
  const exercisesWithResults = [];
  const exerciseStatuses: Record<LessonStatus, string> = {
    TODO: "the exercise has not been started",
    DONE: "correct",
    DONE_WITH_HELP: "correct with the help of some hints",
    PAUSED: "the exercise was not completed",
    ACTIVE: "the exercise is currently being worked on",
  };
  for (const lesson of lessons) {
    const exerciseTurn = lesson.turns.find((turn) => turn.type === "exercise");
    if (!exerciseTurn) continue;
    exercisesWithResults.push({
      exercise: exerciseTurn?.text,
      result: exerciseStatuses[lesson.status],
    });
  }
  return exercisesWithResults.join("\n");
}
