import { z } from "zod";

import { getConceptsForGoal, getGoalById } from "@/core/goal/goalDomain";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const goalRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.dbAdapter.createGoal(ctx.session.user.id, input.name);
    }),

  all: protectedProcedure.query(async ({ ctx }) => {
    return ctx.dbAdapter.getUserGoals(ctx.session.user.id);
  }),

  getConcepts: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const goal = await getGoalById(ctx.dbAdapter, input);
      return getConceptsForGoal(ctx.llmAdapter, ctx.dbAdapter, goal);
    }),
});
