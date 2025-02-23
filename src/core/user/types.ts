import { z } from "zod";

export const User = z.object({
  id: z.string(),
  email: z.string().nullable(),
  name: z.string().nullable(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable(),
});
export type User = z.infer<typeof User>;

// TODO use this in the future
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
