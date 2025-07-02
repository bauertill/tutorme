import { z } from "zod";

export const Message = z.object({
  id: z.string(),
  studentSolutionId: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Message = z.infer<typeof Message>;

export const RecommendedQuestion = z.object({
  question: z.string(),
  studentSolutionId: z.string(),
});

export type RecommendedQuestion = z.infer<typeof RecommendedQuestion>;
