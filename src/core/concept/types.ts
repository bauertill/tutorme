import { z } from "zod";
import { type WithTimestamps } from "../utils";

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

export type Assessment = {
  id: string;
  userId: string;
  conceptId: string;
  logEntries: AssessmentLogEntry[];
  createdAt: Date;
  updatedAt: Date;
};

export type AssessmentLogEntry = {
  id: string;
  question: AssessmentQuestion;
  userResponse: string;
  isCorrect: boolean;
  assessmentId: string;
  createdAt: Date;
};

export const AssessmentQuestion = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  explanation: z.string(),
});

export type AssessmentQuestion = z.infer<typeof AssessmentQuestion>;
