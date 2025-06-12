import { Canvas } from "@/core/canvas/canvas.types";
import { StudentRepository } from "@/core/student/student.repository";
import {
  evaluateSolution,
  setStudentSolutionCanvas,
} from "@/core/studentSolution/studentSolution.domain";
import { StudentSolutionRepository } from "@/core/studentSolution/studentSolution.repository";
import {
  createTRPCRouter,
  limitedPublicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const studentSolutionRouter = createTRPCRouter({
  submitSolution: limitedPublicProcedure
    .input(
      z.object({
        problemId: z.string(),
        studentAssignmentId: z.string(),
        exerciseText: z.string(),
        canvas: Canvas,
        solutionImage: z.string(),
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

  listStudentSolutions: protectedProcedure.query(async ({ ctx }) => {
    const studentRepository = new StudentRepository(ctx.db);
    const studentId = await studentRepository.getStudentIdByUserIdOrThrow(
      ctx.session.user.id,
    );
    const studentSolutionRepository = new StudentSolutionRepository(ctx.db);
    return await studentSolutionRepository.getStudentSolutionsByStudentId(
      studentId,
    );
  }),

  setStudentSolutionCanvas: protectedProcedure
    .input(
      z.object({
        problemId: z.string(),
        studentAssignmentId: z.string(),
        canvas: Canvas,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await setStudentSolutionCanvas(
        input.studentAssignmentId,
        input.problemId,
        input.canvas,
        ctx.db,
      );
    }),
});
