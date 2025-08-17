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
      const studentContextRepository = new StudentContextRepository(ctx.db);
      return studentContextRepository.upsertStudentContext({
        ...input,
        userId: ctx.session.user.id,
      });
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
    return await getConceptsForStudent(
      ctx.session.user.id,
      ctx.userLanguage,
      ctx.llmAdapter,
      ctx.db,
    );
  }),
});
