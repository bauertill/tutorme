import { getInitialStudentAssessment } from "@/core/studentContext/studentContext.domain";
// import { StudentSolutionRepository } from "@/core/studentSolution/studentSolution.repository"; // Not used in this router
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

export const assignmentRouter = createTRPCRouter({
  createInitialStudentProblems: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const result = await getInitialStudentAssessment(
        ctx.session.user.id,
        ctx.userLanguage,
        ctx.llmAdapter,
        ctx.db,
      );
      return result;
    } catch (error) {
      console.error("Failed to create initial student problems:", error);
      throw error;
    }
  }),

  getStudentProblems: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get all problems for the user through their student solutions
      const studentSolutions = await ctx.db.studentSolution.findMany({
        where: {
          userId: ctx.session.user.id,
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        include: {
          problem: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return studentSolutions.map((solution) => (solution as any).problem); // eslint-disable-line @typescript-eslint/no-explicit-any
    } catch (error) {
      console.error("Error in getStudentProblems:", error);
      return [];
    }
  }),

  getDailyProgress: protectedProcedure.query(async ({ ctx }) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaySolutions = await ctx.db.studentSolution.findMany({
        where: {
          userId: ctx.session.user.id,
          updatedAt: {
            gte: today,
            lt: tomorrow,
          },
          status: "SOLVED",
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      });

      return {
        completed: todaySolutions.length,
        remaining: Math.max(0, 5 - todaySolutions.length), // Assuming daily goal of 5
      };
    } catch (error) {
      console.error("Error in getDailyProgress:", error);
      return { completed: 0, remaining: 5 };
    }
  }),

  // Legacy admin methods - these are called by admin components but assignments no longer exist
  // Return empty results or throw errors to indicate the functionality has changed
  deleteAllAssignmentsAndProblems: protectedProcedure.mutation(async () => {
    // TODO: Implement deletion of all problems for admin if needed
    throw new Error(
      "Assignment functionality has been removed. Use problem management instead.",
    );
  }),

  createAssignmentFromProblems: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        problemIds: z.array(z.string()),
      }),
    )
    .mutation(async () => {
      // TODO: This functionality needs to be reimplemented for the new structure
      throw new Error(
        "Assignment functionality has been removed. Problems are now managed directly.",
      );
    }),

  listGroupAssignments: protectedProcedure.query(async () => {
    // Return empty array since assignments no longer exist
    return [];
  }),

  deleteAllStudentData: protectedProcedure.mutation(async ({ ctx }) => {
    // Delete all student solutions and problems for the user
    await ctx.db.studentSolution.deleteMany({
      where: { userId: ctx.session.user.id } as any,
    });

    // Also delete student context if needed
    await ctx.db.studentContext.deleteMany({
      where: { userId: ctx.session.user.id },
    });

    return { success: true };
  }),

  createExampleAssignment: protectedProcedure.mutation(async () => {
    // TODO: This should create example problems instead of assignments
    throw new Error(
      "Example assignment functionality needs to be reimplemented for problems",
    );
  }),

  // Add missing methods that are being called by components
  deleteAssignment: protectedProcedure
    .input(z.object({ assignmentId: z.string() }))
    .mutation(async () => {
      throw new Error("Assignment deletion not available in new structure");
    }),

  createFromUpload: protectedProcedure.input(z.any()).mutation(async () => {
    throw new Error("Upload functionality needs to be reimplemented");
  }),
});
