import {
  createProblemsFromCsv,
  queryProblems,
} from "@/core/problem/problemDomain";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const problemRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(z.object({ base64EncodedContents: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const csv = Buffer.from(input.base64EncodedContents, "base64").toString(
        "utf-8",
      );
      await createProblemsFromCsv(csv, ctx.dbAdapter);
    }),
  query: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      return await queryProblems(input.query, ctx.dbAdapter);
    }),
});
