import { z } from "zod";

export const Problem = z.object({
  id: z.string(),
  dataset: z.string(),
  problem: z.string(),
  solution: z.string(),
  level: z.string(),
  type: z.string(),
});

export type Problem = z.infer<typeof Problem>;

export type ProblemQueryResult = {
  problem: Problem;
  score: number;
};
