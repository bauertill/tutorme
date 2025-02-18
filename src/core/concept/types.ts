import { z } from "zod";

export const QuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  explanation: z.string(),
});

export type Question = z.infer<typeof QuestionSchema>;

export const QuizSchema = z.object({
  questions: z.array(QuestionSchema),
});

export type QuizSchema = z.infer<typeof QuizSchema>;
