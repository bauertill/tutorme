import {
  addMessage,
  generateHelpReply,
  getMessages,
  recommendQuestions,
  setMessageThumbsDown,
} from "@/core/help/help.domain";
import { Message } from "@/core/help/help.types";
import {
  createTRPCRouter,
  limitedPublicProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const helpRouter = createTRPCRouter({
  ask: limitedPublicProcedure
    .input(
      z.object({
        problemId: z.string(),
        messages: z.array(Message),
        problem: z.string(),
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
  setMessageThumbsDown: limitedPublicProcedure
    .input(
      z.object({
        problemId: z.string(),
        messages: z.array(Message),
        problem: z.string(),
        solutionImage: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await setMessageThumbsDown(
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
        problem: z.string(),
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
  getMessages: protectedProcedure
    .input(
      z.object({
        studentSolutionId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // @TODO authorize
      return await getMessages(ctx.db, input.studentSolutionId);
    }),
  addMessage: protectedProcedure
    .input(Message)
    .mutation(async ({ ctx, input }) => {
      // @TODO authorize
      return await addMessage(ctx.db, input);
    }),
});
