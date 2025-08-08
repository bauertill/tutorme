import { z } from "zod";

export const StudentContext = z.object({
  userId: z.string(),
  grade: z.enum(["8", "9", "10", "11", "12", "13"]),
  country: z.enum(["us", "uk", "ca", "au", "de", "fr", "es", "nl", "other"]),
  textbook: z.string(),
  nextTestDate: z.date().optional(),
});

export type StudentContext = z.infer<typeof StudentContext>;
