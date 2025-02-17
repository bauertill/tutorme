import { z } from "zod";

export const User = z.object({
    id: z.number().int(),
    email: z.string(),
    name: z.string().nullable(),
  });
  export type User = z.infer<typeof User>;