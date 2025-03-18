import { z } from "zod";

export const AppUsage = z.object({
  id: z.string(),
  fingerprint: z.string(),
  creditsUsed: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AppUsage = z.infer<typeof AppUsage>;
