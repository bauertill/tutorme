import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createLesson, findEducationalVideo } from "@/core/learning/learningDomain";


export const learningRouter = createTRPCRouter({
  /**
   * Search for educational videos on YouTube
   */
  searchEducationalVideo: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return findEducationalVideo(
        input.conceptId,
        ctx.dbAdapter,
        ctx.llmAdapter,
        ctx.youtubeAdapter,
      );
    }),

  /**
   * Create a new lesson for a concept
   */
  createLesson: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return createLesson(
        input.conceptId,
        ctx.session.user.id,
        ctx.dbAdapter,
        ctx.llmAdapter,
      );
    }),

  /**
   * Get all lessons for a concept
   */
  getLessonsByConceptId: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.dbAdapter.getLessonsByConceptId(input.conceptId);
    }),
}); 