import { z } from "zod";

import {
  createGoal,
  getGoalById,
  getGoalByIdIncludeConcepts,
} from "@/core/goal/goalDomain";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const goalRouter = createTRPCRouter({
  byId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return getGoalById(ctx.dbAdapter, input);
  }),

  byIdIncludeConcepts: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return getGoalByIdIncludeConcepts(ctx.dbAdapter, input);
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return createGoal(
        ctx.dbAdapter,
        ctx.session.user.id,
        input.name,
        ctx.llmAdapter,
        ctx.pubsubAdapter,
      );
    }),

  all: protectedProcedure.query(async ({ ctx }) => {
    return ctx.dbAdapter.getUserGoals(ctx.session.user.id);
  }),

  onConceptGenerated: protectedProcedure
    .input(z.object({ goalId: z.string() }))
    .subscription(async function* ({ ctx, input, signal }) {
      const it = ctx.pubsubAdapter.subscribeIterator({
        channel: "concept:generated",
        key: input.goalId,
        signal,
      });
      for await (const concept of it) {
        yield concept;
      }
    }),
});
