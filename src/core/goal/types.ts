import { z } from "zod";

export const Goal = z.object({
  id: z.string(),
  userId: z.number(),
  goal: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Goal = z.infer<typeof Goal>;

const MasteryLevel = z.enum([
  "unknown",
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);
export const Concept = z.object({
  id: z.string(),
  goalId: z.string(),
  name: z.string(),
  description: z.string(),
  masteryLevel: MasteryLevel,
});

export type Concept = z.infer<typeof Concept>;
