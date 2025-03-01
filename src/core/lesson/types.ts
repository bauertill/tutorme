import { z } from "zod";

const LessonExplanationTurn = z.object({
  type: z.literal("explanation"),
  text: z.string(),
});
export type LessonExplanationTurn = z.infer<typeof LessonExplanationTurn>;

const LessonExerciseTurn = z.object({
  type: z.literal("exercise"),
  text: z.string(),
  solution: z.string(),
  problemId: z.string(),
});
export type LessonExerciseTurn = z.infer<typeof LessonExerciseTurn>;

const LessonUserInputTurn = z.object({
  type: z.literal("user_input"),
  text: z.string(),
});
export type LessonUserInputTurn = z.infer<typeof LessonUserInputTurn>;

const LessonTurn = z.discriminatedUnion("type", [
  LessonExplanationTurn,
  LessonExerciseTurn,
  LessonUserInputTurn,
]);
export type LessonTurn = z.infer<typeof LessonTurn>;

export const LessonIteration = z.object({
  turns: z.array(LessonTurn),
  evaluation: z.string().optional(),
});
export type LessonIteration = z.infer<typeof LessonIteration>;

export const LessonStatus = z.enum(["ACTIVE", "DONE"]);
export type LessonStatus = z.infer<typeof LessonStatus>;

export const Lesson = z.object({
  id: z.string(),
  lessonGoal: z.string(),
  lessonIterations: z.array(LessonIteration),
  status: LessonStatus,
  conceptId: z.string(),
  goalId: z.string(),
  userId: z.string(),
});
export type Lesson = z.infer<typeof Lesson>;
