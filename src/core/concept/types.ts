import { z } from "zod";

export const QuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  explanation: z.string(),
});

export type QuestionSchema = z.infer<typeof QuestionSchema>;

export const Question = QuestionSchema.extend({
  id: z.string(),
});

export type Question = z.infer<typeof Question>;

export const QuizSchema = z.object({
  questions: z.array(QuestionSchema),
});

export type QuizSchema = z.infer<typeof QuizSchema>;

export const Quiz = QuizSchema.extend({
  id: z.string(),
  conceptId: z.string(),
});

export type Quiz = z.infer<typeof Quiz>;

export interface QuestionResponse {
  userId: number;
  questionId: string;
  answer: string;
  isCorrect: boolean;
}

export interface StoredQuestionResponse extends QuestionResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// @TODO separate data types into db and domain
// Have a generic DBType that extends types with id, createdAt, updatedAt
