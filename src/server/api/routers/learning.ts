import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { findEducationalVideos } from "@/core/learning/learningDomain";


export const learningRouter = createTRPCRouter({
  /**
   * Search for educational videos on YouTube
   */
  searchEducationalVideos: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return findEducationalVideos(
        input.conceptId,
        ctx.dbAdapter,
        ctx.llmAdapter,
        ctx.youtubeAdapter,
      );
    }),


}); 