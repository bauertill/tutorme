import { generateHelpReply } from "@/core/help/helpDomain";
import { Message } from "@/core/help/types";
import { createTRPCRouter, limitedPublicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const helpRouter = createTRPCRouter({
  ask: limitedPublicProcedure
    .input(
      z.object({
        messages: z.array(Message),
        problem: z.string().nullable(),
        solutionImage: z.string().nullable(), // Base64 encoded image data
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await generateHelpReply(
        input.messages,
        input.problem,
        input.solutionImage,
        ctx.llmAdapter,
        ctx.userLanguage,
      );
    }),
});
