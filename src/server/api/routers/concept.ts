import { z } from "zod";

import { MasteryLevel } from "@/core/goal/types";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
export const conceptRouter = createTRPCRouter({
  byId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.dbAdapter.getConceptWithGoalByConceptId(input);
  }),
  updateMasteryLevel: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
        masteryLevel: MasteryLevel,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.dbAdapter.updateConceptMasteryLevel(
        input.conceptId,
        input.masteryLevel,
      );
    }),
});
