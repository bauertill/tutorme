import {
  evaluateSolution,
  getRandomProblem,
} from "@/core/exercise/exerciseDomain";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const exerciseRouter = createTRPCRouter({
  /**
   * Submit a drawn solution for an exercise
   */
  submitSolution: publicProcedure
    .input(
      z.object({
        exerciseId: z.string().optional(),
        exerciseText: z.string(),
        solutionImage: z.string(), // Base64 encoded image data
      }),
    )
    .mutation(async ({ input }) => {
      return evaluateSolution(input.exerciseText, input.solutionImage);
    }),

  getRandomProblem: publicProcedure.query(async ({ ctx }) => {
    return await getRandomProblem(ctx.dbAdapter);
  }),
});
