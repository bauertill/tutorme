import {
  createReferenceSolution,
  queryProblems,
} from "@/core/problem/problem.domain";
import { ProblemRepository } from "@/core/problem/problem.repository";
import {
  createTRPCRouter,
  protectedAdminProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const problemRouter = createTRPCRouter({
  query: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      return await queryProblems(input.query, 25, ctx.db);
    }),

  createReferenceSolution: publicProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      return await createReferenceSolution(
        input,
        ctx.llmAdapter,
        ctx.userLanguage,
      );
    }),

  adminUploadProblems: protectedAdminProcedure
    .input(z.string())
    .mutation(async ({ ctx }) => {
      if (!ctx.session.user.id)
        throw new Error("User must be present for admin actions");
      // TODO: Implement admin upload problems
      throw new Error("Not implemented");
    }),

  getProblems: protectedAdminProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.id)
      throw new Error("User must be present for admin actions");
    const problemRepository = new ProblemRepository(ctx.db);
    return await problemRepository.getProblemsByUserId(ctx.session.user.id);
  }),
});
