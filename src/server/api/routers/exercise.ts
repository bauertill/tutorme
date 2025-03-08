import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

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
    .mutation(async ({ input, ctx }) => {
      // Here you would typically:
      // 1. Save the image to storage (or database as a blob)
      // 2. Create a record of the submission
      // 3. Return a success message or ID
      
      // This is a placeholder implementation
      console.log(`Received solution for exercise: ${input.exerciseText.substring(0, 30)}...`);
      console.log(`Solution image: ${input.solutionImage.substring(0, 30)}...`);
      
      // For now, just return success message
      return {
        success: true,
        message: "Solution submitted successfully",
        timestamp: new Date().toISOString(),
      };
    }),
}); 