import { z } from "zod";

export const Message = z.object({
  id: z.string(),
  threadId: z.string().nullable(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  createdAt: z.date(),
});

export type Message = z.infer<typeof Message>;

export const RecommendedQuestion = z.object({
  question: z.string(),
  threadId: z.string(),
});

export type RecommendedQuestion = z.infer<typeof RecommendedQuestion>;
