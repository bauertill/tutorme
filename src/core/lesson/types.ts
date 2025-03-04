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
});
export type LessonExerciseTurn = z.infer<typeof LessonExerciseTurn>;

const LessonUserInputTurn = z.object({
  type: z.literal("user_input"),
  text: z.string(),
});
export type LessonUserInputTurn = z.infer<typeof LessonUserInputTurn>;

export const LessonTurn = z.discriminatedUnion("type", [
  LessonExplanationTurn,
  LessonExerciseTurn,
  LessonUserInputTurn,
]);
export type LessonTurn = z.infer<typeof LessonTurn>;

export const LessonStatus = z.enum([
  "ACTIVE",
  "PAUSED",
  "DONE_WITH_HELP",
  "DONE",
]);
export type LessonStatus = z.infer<typeof LessonStatus>;

export const Lesson = z.object({
  id: z.string(),
  lessonGoal: z.string(),
  turns: z.array(LessonTurn),
  status: LessonStatus,
  conceptId: z.string(),
  goalId: z.string(),
  userId: z.string(),
  problemId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Lesson = z.infer<typeof Lesson>;

const DraftLesson = Lesson.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type DraftLesson = z.infer<typeof DraftLesson>;
