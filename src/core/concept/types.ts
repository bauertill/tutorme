import { z } from "zod";
import { GenerationStatus } from "..";
import { Goal } from "../goal/types";

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

export const Concept = z.object({
  id: z.string(),
  goalId: z.string(),
  name: z.string(),
  description: z.string(),
  masteryLevel: MasteryLevel,
  teacherReport: z.string().nullable(),
  generationStatus: GenerationStatus,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Concept = z.infer<typeof Concept>;

export const ConceptWithGoal = Concept.extend({
  goal: Goal,
});

export type ConceptWithGoal = z.infer<typeof ConceptWithGoal>;
