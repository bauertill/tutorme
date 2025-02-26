import { z } from "zod";

import { invokeAssessmentGraph } from "@/core/concept/conceptDomain";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const conceptRouter = createTRPCRouter({
  byId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.dbAdapter.getConceptWithGoalByConceptId(input);
  }),
  invokeAssessment: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return invokeAssessmentGraph(ctx.llmAdapter, input);
    }),
});
