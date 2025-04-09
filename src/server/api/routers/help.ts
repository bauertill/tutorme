import { generateHelpReply, recommendQuestions } from "@/core/help/helpDomain";
import { Message } from "@/core/help/types";
import {
  createTRPCRouter,
  limitedPublicProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const helpRouter = createTRPCRouter({
  ask: limitedPublicProcedure
    .input(
      z.object({
        problemId: z.string(),
        messages: z.array(Message),
        problem: z.string().nullable(),
        solutionImage: z.string().nullable(), // Base64 encoded image data
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await generateHelpReply(
        {
          ...input,
          language: ctx.userLanguage,
        },
        ctx.llmAdapter,
      );
    }),
  recommendQuestions: publicProcedure
    .input(
      z.object({
        problem: z.string().nullable(),
        solutionImage: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await recommendQuestions(
        input.problem,
        input.solutionImage,
        ctx.llmAdapter,
        ctx.userLanguage,
      );
    }),
});
