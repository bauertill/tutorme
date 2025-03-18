import {
  createAssignmentFromUpload,
  syncAssignments,
} from "@/core/assignment/assignmentDomain";
import { Assignment, UserProblem } from "@/core/assignment/types";
import {
  createReferenceSolution,
  evaluateSolution,
  explainHint,
  getRandomProblem,
} from "@/core/exercise/exerciseDomain";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const assignmentRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.dbAdapter.getAssignmentsByUserId(ctx.session.user.id);
  }),

  createFromUpload: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await createAssignmentFromUpload(
        input,
        ctx.session?.user?.id,
        ctx.dbAdapter,
        ctx.llmAdapter,
      );
    }),

  getRandomProblem: publicProcedure.query(async ({ ctx }) => {
    return await getRandomProblem(ctx.dbAdapter);
  }),

  submitSolution: publicProcedure
    .input(
      z.object({
        exerciseId: z.string().optional(),
        exerciseText: z.string(),
        solutionImage: z.string(), // Base64 encoded image data
        referenceSolution: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return evaluateSolution(
        input.exerciseText,
        input.solutionImage,
        input.referenceSolution,
        ctx.llmAdapter,
      );
    }),

  createReferenceSolution: publicProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      return await createReferenceSolution(input, ctx.llmAdapter);
    }),

  explainHint: publicProcedure
    .input(z.object({ userProblem: UserProblem, highlightedText: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await explainHint(
        input.userProblem,
        input.highlightedText,
        ctx.llmAdapter,
      );
    }),

  syncAssignments: protectedProcedure
    .input(z.array(Assignment))
    .mutation(async ({ ctx, input }) => {
      return await syncAssignments(ctx.session.user.id, ctx.dbAdapter, input);
    }),
});
