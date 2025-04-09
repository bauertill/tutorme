import {
  createAssignmentFromUpload,
  getExampleAssignment,
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
  limitedPublicProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const assignmentRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.dbAdapter.getAssignmentsByUserId(ctx.session.user.id);
  }),

  createFromUpload: limitedPublicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await createAssignmentFromUpload(
        input,
        ctx.session?.user?.id,
        ctx.dbAdapter,
        ctx.llmAdapter,
        ctx.userLanguage,
      );
    }),
  deleteAssignment: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await ctx.dbAdapter.deleteAssignmentById(input);
    }),
  deleteAllAssignments: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session.user.id) return;
    return await ctx.dbAdapter.deleteAllAssignments(ctx.session.user.id);
  }),

  getRandomProblem: publicProcedure.query(async ({ ctx }) => {
    return await getRandomProblem(ctx.dbAdapter);
  }),

  submitSolution: limitedPublicProcedure
    .input(
      z.object({
        problemId: z.string(),
        exerciseText: z.string(),
        solutionImage: z.string(), // Base64 encoded image data
        referenceSolution: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return evaluateSolution(
        {
          ...input,
          language: ctx.userLanguage,
        },
        ctx.llmAdapter,
      );
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

  explainHint: limitedPublicProcedure
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

  getExampleAssignment: publicProcedure.query(async ({ ctx }) => {
    return getExampleAssignment(ctx.userLanguage);
  }),
});
