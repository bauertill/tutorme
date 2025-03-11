import { createAssignmentFromUpload } from "@/core/assignment/assignmentDomain";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const assignmentRouter = createTRPCRouter({
  createFromUpload: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await createAssignmentFromUpload(
        input,
        ctx.session?.user.id,
        ctx.dbAdapter,
        ctx.llmAdapter,
      );
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.dbAdapter.getAssignmentsByUserId(ctx.session.user.id);
  }),
});
