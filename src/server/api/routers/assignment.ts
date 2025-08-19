import { getInitialStudentAssessment } from "@/core/studentContext/studentContext.domain";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const assignmentRouter = createTRPCRouter({
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
});
