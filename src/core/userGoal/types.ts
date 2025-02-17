import { z } from "zod";

export const User = z.object({
  id: z.number().int(),
  email: z.string(),
  name: z.string(),
});
export type User = z.infer<typeof User>;

export const UserContext = z.object({
  birthyear: z.number(),
  gender: z.enum(["male", "female"]),
  education: z.enum([
    "primarySchool",
    "highSchool",
    "bachelor",
    "master",
    "doctor",
  ]),
  preferredLanguage: z.literal("english"),
});
export type UserContext = z.infer<typeof UserContext>;

export const Goal = z.object({
  id: z.string(),
  userId: z.number(),
  goal: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Goal = z.infer<typeof Goal>;

export const Concept = z.object({
  id: z.string(),
  goalId: z.string(),
  name: z.string(),
  description: z.string(),
});

export type Concept = z.infer<typeof Concept>;
