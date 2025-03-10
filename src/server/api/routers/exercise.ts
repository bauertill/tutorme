import {
  createReferenceSolution,
  evaluateSolution,
  getRandomProblem,
} from "@/core/exercise/exerciseDomain";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const exerciseRouter = createTRPCRouter({
  /**
   * Submit a drawn solution for an exercise
   */
  submitSolution: publicProcedure // TODO: think about auth
    .input(
      z.object({
        exerciseId: z.string().optional(),
        exerciseText: z.string(),
        solutionImage: z.string(), // Base64 encoded image data
        referenceSolution: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return evaluateSolution(
        input.exerciseText,
        input.solutionImage,
        input.referenceSolution,
        ctx.llmAdapter,
      );
    }),

  getRandomProblem: publicProcedure.query(async ({ ctx }) => {
    return await getRandomProblem(ctx.dbAdapter);
  }),

  createReferenceSolution: publicProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      return await createReferenceSolution(input, ctx.llmAdapter);
    }),
});
