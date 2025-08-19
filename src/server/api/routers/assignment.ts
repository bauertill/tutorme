import {
  addProblemsToStudentAssignment,
  adminCreateAssignment,
  createStudentAssignment,
  createStudentAssignmentFromUpload,
  createStudentExampleAssignment,
  deleteAllAssignmentsAndProblemsByUserId,
  deleteAllStudentDataByUserId,
} from "@/core/assignment/assignment.domain";
import { AssignmentRepository } from "@/core/assignment/assignment.repository";
import { syncAssignments } from "@/core/assignment/assignment.sync";
import { StudentAssignment } from "@/core/assignment/assignment.types";
import { StudentRepository } from "@/core/student/student.repository";
import { getInitialStudentAssessment } from "@/core/studentContext/studentContext.domain";
import {
  createTRPCRouter,
  limitedPublicProcedure,
  protectedAdminProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const assignmentRouter = createTRPCRouter({
  listGroupAssignments: protectedProcedure.query(async ({ ctx }) => {
    const assignmentRepository = new AssignmentRepository(ctx.db);
    return await assignmentRepository.getGroupAssignmentsByUserId(
      ctx.session.user.id,
    );
  }),

  getDailyProgress: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input: studentAssignmentId }) => {
      const assignmentRepository = new AssignmentRepository(ctx.db);
      return await assignmentRepository.getDailyProgress(studentAssignmentId);
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
  createInitialStudentAssignment: protectedProcedure.mutation(
    async ({ ctx }) => {
      return await getInitialStudentAssessment(
        ctx.session.user.id,
        ctx.userLanguage,
        ctx.llmAdapter,
        ctx.db,
      );
    },
  ),

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

  syncAssignments: protectedProcedure
    .input(z.array(StudentAssignment))
    .mutation(async ({ ctx, input }) => {
      return await syncAssignments(ctx.session.user.id, ctx.db, input);
    }),

  createExampleAssignment: protectedProcedure.mutation(async ({ ctx }) => {
    return createStudentExampleAssignment(
      ctx.userLanguage,
      ctx.session.user.id,
      ctx.db,
    );
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
  deleteAllStudentData: protectedProcedure.mutation(async ({ ctx }) => {
    await deleteAllStudentDataByUserId(ctx.session.user.id, ctx.db);
    return { success: true };
  }),

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

  addProblemsToStudentAssignment: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        count: z.number().min(1).max(5).default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { assignmentId, count } = input;
      const { problemIds } = await addProblemsToStudentAssignment(
        assignmentId,
        count,
        ctx.session.user.id,
        ctx.userLanguage,
        ctx.llmAdapter,
        ctx.db,
      );
      return { problemIds };
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
