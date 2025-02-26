import { z } from "zod";

import {
  addUserResponseToAssessment,
  createAssessment,
} from "@/core/concept/conceptDomain";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const conceptRouter = createTRPCRouter({
  byId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.dbAdapter.getConceptWithGoalByConceptId(input);
  }),

  createAssessment: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return createAssessment(
        ctx.session.user.id,
        input.conceptId,
        ctx.dbAdapter,
        ctx.llmAdapter,
      );
    }),
  addUserResponseToAssessment: protectedProcedure
    .input(
      z.object({
        assessmentId: z.string(),
        userResponse: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return addUserResponseToAssessment(
        input.assessmentId,
        input.userResponse,
        ctx.llmAdapter,
        ctx.dbAdapter,
      );
    }),
});
