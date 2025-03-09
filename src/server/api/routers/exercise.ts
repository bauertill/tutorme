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
      // Here you would typically:
      // 1. Save the image to storage (or database as a blob)
      // 2. Create a record of the submission
      // 3. Return a success message or ID

      console.log(
        `Received solution for exercise: ${input.exerciseText.substring(0, 30)}...`,
      );

      // Evaluate the solution using the LLM
      const evaluationResult = await evaluateSolution(
        input.exerciseText,
        input.solutionImage,
      );

      // Return the evaluation result
      return evaluationResult;
    }),

  getRandomProblem: publicProcedure.query(async ({ ctx }) => {
    return await getRandomProblem(ctx.dbAdapter);
  }),
});
