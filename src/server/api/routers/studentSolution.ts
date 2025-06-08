import { getExampleAssignment } from "@/core/assignment/assignment.domain";
import { StudentRepository } from "@/core/student/student.repository";
import { evaluateSolution } from "@/core/studentSolution/studentSolution.domain";
import { StudentSolutionRepository } from "@/core/studentSolution/studentSolution.repository";
import { syncStudentSolutions } from "@/core/studentSolution/studentSolution.sync";
import { StudentSolution } from "@/core/studentSolution/studentSolution.types";
import {
  createTRPCRouter,
  limitedPublicProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const studentSolutionRouter = createTRPCRouter({
  submitSolution: limitedPublicProcedure
    .input(
      z.object({
        problemId: z.string(),
        studentAssignmentId: z.string(),
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

  syncStudentSolutions: protectedProcedure
    .input(z.array(StudentSolution))
    .mutation(async ({ ctx, input }) => {
      return await syncStudentSolutions(ctx.session.user.id, ctx.db, input);
    }),

  getExampleAssignment: publicProcedure.query(async ({ ctx }) => {
    return getExampleAssignment(ctx.userLanguage);
  }),
});
