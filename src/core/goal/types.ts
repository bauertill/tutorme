import { z } from "zod";
import type { Concept } from "../concept/types";

export const Goal = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
});

export type Goal = z.infer<typeof Goal>;

export type GoalWithConcepts = Goal & {
  concepts: Concept[];
};

export const MasteryLevel = z.enum([
  "UNKNOWN",
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
]);
export type MasteryLevel = z.infer<typeof MasteryLevel>;

