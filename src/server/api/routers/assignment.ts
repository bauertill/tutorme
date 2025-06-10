import {
  adminCreateAssignment,
  createStudentAssignment,
  createStudentAssignmentFromUpload,
  deleteAllAssignmentsAndProblemsByUserId,
  getExampleAssignment,
} from "@/core/assignment/assignment.domain";
import { AssignmentRepository } from "@/core/assignment/assignment.repository";
import { syncAssignments } from "@/core/assignment/assignment.sync";
import { StudentAssignment } from "@/core/assignment/assignment.types";
import { StudentRepository } from "@/core/student/student.repository";
import { evaluateSolution } from "@/core/studentSolution/studentSolution.domain";
import {
  createTRPCRouter,
  limitedPublicProcedure,
  protectedAdminProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const assignmentRouter = createTRPCRouter({
  listGroupAssignments: protectedProcedure.query(async ({ ctx }) => {
    const assignmentRepository = new AssignmentRepository(ctx.db);
    return await assignmentRepository.getGroupAssignmentsByUserId(
      ctx.session.user.id,
    );
  }),

  getStudentAssignment: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const assignmentRepository = new AssignmentRepository(ctx.db);
      return await assignmentRepository.getStudentAssignmentById(input);
    }),

  listStudentAssignments: protectedProcedure.query(async ({ ctx }) => {
    const studentRepository = new StudentRepository(ctx.db);
    const studentId = await studentRepository.getStudentIdByUserIdOrThrow(
      ctx.session.user.id,
    );
    const assignmentRepository = new AssignmentRepository(ctx.db);
    return await assignmentRepository.getStudentAssignmentsByStudentId(
      studentId,
    );
  }),

  createFromUpload: limitedPublicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const studentRepository = new StudentRepository(ctx.db);
      const userId = ctx.session?.user.id;
      const studentId = userId
        ? await studentRepository.getStudentIdByUserIdOrThrow(userId)
        : undefined;
      return await createStudentAssignmentFromUpload(
        input,
        userId,
        studentId,
        ctx.db,
        ctx.llmAdapter,
        ctx.userLanguage,
      );
    }),
  deleteAssignment: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const assignmentRepository = new AssignmentRepository(ctx.db);
      return await assignmentRepository.deleteStudentAssignmentById(input);
    }),
  renameAssignment: protectedProcedure
    .input(z.object({ assignmentId: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input: { assignmentId, name } }) => {
      const assignmentRepository = new AssignmentRepository(ctx.db);
      return await assignmentRepository.updateStudentAssignmentName(
        assignmentId,
        name,
      );
    }),
  deleteAllStudentAssignments: protectedProcedure.mutation(async ({ ctx }) => {
    const assignmentRepository = new AssignmentRepository(ctx.db);
    return await assignmentRepository.deleteAllStudentAssignmentsByUserId(
      ctx.session.user.id,
    );
  }),

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

  syncAssignments: protectedProcedure
    .input(z.array(StudentAssignment))
    .mutation(async ({ ctx, input }) => {
      return await syncAssignments(ctx.session.user.id, ctx.db, input);
    }),

  getExampleAssignment: publicProcedure.query(async ({ ctx }) => {
    return getExampleAssignment(ctx.userLanguage);
  }),

  deleteAllAssignmentsAndProblems: protectedAdminProcedure.mutation(
    async ({ ctx }) => {
      await deleteAllAssignmentsAndProblemsByUserId(
        ctx.session.user.id,
        ctx.db,
      );
      return { success: true };
    },
  ),

  createStudentAssignment: protectedProcedure
    .input(StudentAssignment)
    .mutation(async ({ ctx, input }) => {
      const assignment = await createStudentAssignment(
        input,
        ctx.session.user.id,
        ctx.db,
      );
      return assignment;
    }),

  createAssignmentFromProblems: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        problemIds: z.array(z.string()),
        studentGroupId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const assignment = await adminCreateAssignment(
        input,
        ctx.session.user.id,
        ctx.db,
      );
      return assignment;
    }),
});
