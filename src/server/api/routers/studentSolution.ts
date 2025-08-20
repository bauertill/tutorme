import { Canvas } from "@/core/canvas/canvas.types";
import { RecommendedQuestion } from "@/core/help/help.types";
import {
  addNegativeSampleToAnnotationQueue,
  addPositiveSampleToQualityControlDataset,
} from "@/core/qualityControl/qualityControl.domain";
import {
  evaluateSolution,
  setStudentSolutionCanvas,
  setStudentSolutionEvaluation,
  setStudentSolutionRecommendedQuestions,
} from "@/core/studentSolution/studentSolution.domain";
import { StudentSolutionRepository } from "@/core/studentSolution/studentSolution.repository";
import { EvaluationResult } from "@/core/studentSolution/studentSolution.types";
import {
  createTRPCRouter,
  limitedPublicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const studentSolutionRouter = createTRPCRouter({
  submitSolution: protectedProcedure
    .input(
      z.object({
        studentSolutionId: z.string(),
        exerciseText: z.string(),
        canvas: Canvas,
        solutionImage: z.string(),
        referenceSolution: z.string(),
        problemId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return evaluateSolution(
        {
          ...input,
          language: ctx.userLanguage,
          userId: ctx.session.user.id,
          problemId: input.problemId,
        },
        ctx.llmAdapter,
        ctx.db,
      );
    }),

  addPositiveSampleToQualityControlDataset: protectedProcedure
    .input(
      z.object({
        runId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await addPositiveSampleToQualityControlDataset(
        ctx.llmAdapter,
        input.runId,
      );
      return { success: true };
    }),
  addNegativeSampleToAnnotationQueue: limitedPublicProcedure
    .input(z.object({ runId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await addNegativeSampleToAnnotationQueue(ctx.llmAdapter, input.runId);
      return { success: true };
    }),

  listStudentSolutions: protectedProcedure.query(async ({ ctx }) => {
    const studentSolutionRepository = new StudentSolutionRepository(ctx.db);
    return await studentSolutionRepository.getStudentSolutionsByUserId(
      ctx.session.user.id,
    );
  }),

  setStudentSolutionCanvas: protectedProcedure
    .input(
      z.object({
        problemId: z.string(),
        studentSolutionId: z.string(),
        canvas: Canvas,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await setStudentSolutionCanvas(
        input.studentSolutionId,
        ctx.session.user.id,
        input.problemId,
        input.canvas,
        ctx.db,
      );
    }),

  setStudentSolutionRecommendedQuestions: protectedProcedure
    .input(
      z.object({
        studentSolutionId: z.string(),
        recommendedQuestions: z.array(RecommendedQuestion),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await setStudentSolutionRecommendedQuestions(
        input.studentSolutionId,
        input.recommendedQuestions,
        ctx.db,
      );
    }),

  setStudentSolutionEvaluation: protectedProcedure
    .input(
      z.object({
        studentSolutionId: z.string(),
        evaluation: EvaluationResult,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await setStudentSolutionEvaluation(
        input.studentSolutionId,
        input.evaluation,
        ctx.db,
      );
    }),
});
