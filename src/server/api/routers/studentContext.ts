import { StudentRepository } from "@/core/student/student.repository";
import { getYearEndConceptsForStudent } from "@/core/studentContext/studentContext.domain";
import { StudentContextRepository } from "@/core/studentContext/studentContext.repository";
import { StudentContext } from "@/core/studentContext/studentContext.types";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const studentContextRouter = createTRPCRouter({
  upsertStudentContext: protectedProcedure
    .input(StudentContext.omit({ userId: true }))
    .mutation(async ({ input, ctx }) => {
      const studentRepository = new StudentRepository(ctx.db);
      const studentId = await studentRepository.getStudentIdByUserIdOrThrow(
        ctx.session.user.id,
      );
      const studentContextRepository = new StudentContextRepository(ctx.db);
      return studentContextRepository.upsertStudentContext({
        ...input,
        userId: ctx.session.user.id,
      });
    }),
  getStudentContext: protectedProcedure.query(async ({ ctx }) => {
    const studentContextRepository = new StudentContextRepository(ctx.db);
    return studentContextRepository.getStudentContext(ctx.session.user.id);
  }),
  getYearEndConcepts: protectedProcedure.query(async ({ ctx }) => {
    return await getYearEndConceptsForStudent(
      ctx.session.user.id,
      ctx.userLanguage,
      ctx.llmAdapter,
      ctx.db,
    );
  }),
});
