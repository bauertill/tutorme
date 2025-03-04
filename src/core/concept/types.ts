import { z } from "zod";
import { Goal } from "../goal/types";
import { type WithTimestamps } from "../utils";

export const MasteryLevel = z.enum([
  "UNKNOWN",
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
]);
export type MasteryLevel = z.infer<typeof MasteryLevel>;

// @TODO make MasteryLevel and Difficulty the same thing.
// Make UNKNOWN = difficulty NULL
export const Difficulty = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
]);
export type Difficulty = z.infer<typeof Difficulty>;

export const QuizStatus = z.enum(["ACTIVE", "DONE"]);
export type QuizStatus = z.infer<typeof QuizStatus>;

export const QuestionParams = z.object({
  question: z.string().describe("The question to be asked"),
  options: z.array(z.string()).describe("The options to choose from"),
  correctAnswer: z.string(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  explanation: z.string().describe("An explanation of the correct answer"),
});

export type QuestionParams = z.infer<typeof QuestionParams>;

export const Question = QuestionParams.extend({
  id: z.string(),
  quizId: z.string(),
});

export type Question = z.infer<typeof Question>;

export const Concept = z.object({
  id: z.string(),
  goalId: z.string(),
  name: z.string(),
  description: z.string(),
  masteryLevel: MasteryLevel,
  teacherReport: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Concept = z.infer<typeof Concept>;

export const ConceptWithGoal = Concept.extend({
  goal: Goal,
});

export type ConceptWithGoal = z.infer<typeof ConceptWithGoal>;

export const Quiz = z.object({
  id: z.string(),
  questions: z.array(Question),
  conceptId: z.string(),
  status: QuizStatus,
});

export type Quiz = z.infer<typeof Quiz>;

export const UserQuestionResponse = z.object({
  id: z.string(),
  answer: z.string(),
  isCorrect: z.boolean(),
  userId: z.string(),
  questionId: z.string(),
  quizId: z.string(),
  conceptId: z.string(),
});

export type UserQuestionResponse = z.infer<typeof UserQuestionResponse>;

export type QuestionResponseWithQuestion =
  WithTimestamps<UserQuestionResponse> & {
    question: Question;
  };
