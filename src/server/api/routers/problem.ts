import { queryProblems } from "@/core/problem/problemDomain";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const problemRouter = createTRPCRouter({
  query: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      return await queryProblems(input.query, 25, ctx.dbAdapter);
    }),
});
