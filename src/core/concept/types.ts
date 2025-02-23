import { z } from "zod";
import { type WithTimestamps } from "../utils";

export const Question = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  explanation: z.string(),
  quizId: z.string(),
});

export type Question = z.infer<typeof Question>;

export const Quiz = z.object({
  id: z.string(),
  questions: z.array(Question),
  conceptId: z.string(),
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
