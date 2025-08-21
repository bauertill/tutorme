import { getConceptsForStudent } from "@/core/concept/concept.domain";
import { StudentContextRepository } from "@/core/studentContext/studentContext.repository";
import { StudentContext } from "@/core/studentContext/studentContext.types";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const studentContextRouter = createTRPCRouter({
  upsertStudentContext: protectedProcedure
    .input(StudentContext.omit({ userId: true }))
    .mutation(async ({ input, ctx }) => {
      try {
        const studentContextRepository = new StudentContextRepository(ctx.db);
        const fullData = {
          ...input,
          userId: ctx.session.user.id,
        };

        return await studentContextRepository.upsertStudentContext(fullData);
      } catch (error) {
        console.error("Error in upsertStudentContext:", error);
        throw error;
      }
    }),
  getStudentContext: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      return null;
    }

    const studentContextRepository = new StudentContextRepository(ctx.db);
    return await studentContextRepository.getStudentContext(
      ctx.session.user.id,
    );
  }),
  getConceptsForStudent: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getConceptsForStudent(
        ctx.session.user.id,
        ctx.userLanguage,
        ctx.llmAdapter,
        ctx.db,
      );
    } catch (error) {
      console.error("Error in getConceptsForStudent:", error);
      return [];
    }
  }),
});
