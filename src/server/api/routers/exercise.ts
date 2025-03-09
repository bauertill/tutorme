import {
  evaluateSolution,
  getRandomProblem,
} from "@/core/exercise/exerciseDomain";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const exerciseRouter = createTRPCRouter({
  /**
   * Submit a drawn solution for an exercise
   */
  submitSolution: protectedProcedure
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

  getRandomProblem: protectedProcedure.query(async ({ ctx }) => {
    return await getRandomProblem(ctx.dbAdapter);
  }),
});
