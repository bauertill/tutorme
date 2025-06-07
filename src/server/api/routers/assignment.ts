import {
  adminCreateAssignment,
  createStudentAssignmentFromUpload,
  getExampleAssignment,
  syncAssignments,
} from "@/core/assignment/assignmentDomain";
import {
  StudentAssignmentWithStudentSolutions,
  UserProblem,
} from "@/core/assignment/types";
import {
  createReferenceSolution,
  evaluateSolution,
  explainHint,
  getRandomProblem,
} from "@/core/exercise/exerciseDomain";
import {
  createTRPCRouter,
  limitedPublicProcedure,
  protectedAdminProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const assignmentRouter = createTRPCRouter({
  listGroupAssignments: protectedAdminProcedure.query(async ({ ctx }) => {
    return await ctx.dbAdapter.getGroupAssignmentsByUserId(ctx.session.user.id);
  }),

  listStudentAssignments: protectedAdminProcedure.query(async ({ ctx }) => {
    return await ctx.dbAdapter.getStudentAssignmentsByUserId(
      ctx.session.user.id,
    );
  }),

  createFromUpload: limitedPublicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user.id)
        throw new Error("User must be present for admin actions");
      const studentId = await ctx.dbAdapter.getStudentIdByUserIdOrThrow(
        ctx.session.user.id,
      );
      return await createStudentAssignmentFromUpload(
        input,
        ctx.session.user.id,
        studentId,
        ctx.dbAdapter,
        ctx.llmAdapter,
        ctx.userLanguage,
      );
    }),
  deleteAssignment: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await ctx.dbAdapter.deleteGroupAssignmentById(input);
    }),
  renameAssignment: protectedProcedure
    .input(z.object({ assignmentId: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input: { assignmentId, name } }) => {
      return await ctx.dbAdapter.updateGroupAssignmentName(assignmentId, name);
    }),
  deleteAllStudentAssignments: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session.user.id) return;
    return await ctx.dbAdapter.deleteAllStudentAssignmentsByUserId(
      ctx.session.user.id,
    );
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
    .input(z.array(StudentAssignmentWithStudentSolutions))
    .mutation(async ({ ctx, input }) => {
      return await syncAssignments(ctx.session.user.id, ctx.dbAdapter, input);
    }),

  getExampleAssignment: publicProcedure.query(async ({ ctx }) => {
    return getExampleAssignment(ctx.userLanguage);
  }),

  adminUploadProblems: protectedAdminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.id)
        throw new Error("User must be present for admin actions");
      // TODO: Implement admin upload problems
      throw new Error("Not implemented");
    }),

  getProblems: protectedAdminProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.id)
      throw new Error("User must be present for admin actions");
    return await ctx.dbAdapter.getProblemsByUserId(ctx.session.user.id);
  }),

  deleteAllProblemsAndAssignments: protectedAdminProcedure.mutation(
    async ({ ctx }) => {
      if (!ctx.session.user.id)
        throw new Error("User must be present for admin actions");
      await ctx.dbAdapter.deleteAllProblemsAndAssignmentsByUserId(
        ctx.session.user.id,
      );
      return { success: true };
    },
  ),

  createAssignmentFromProblems: protectedAdminProcedure
    .input(
      z.object({
        name: z.string(),
        problemIds: z.array(z.string()),
        studentGroupId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.id)
        throw new Error("User must be present for admin actions");
      const assignment = await adminCreateAssignment(
        input,
        ctx.session.user.id,
        ctx.dbAdapter,
      );
      return assignment;
    }),
});
