import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { findEducationalVideo } from "@/core/learning/learningDomain";


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


}); 