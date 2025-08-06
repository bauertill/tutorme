import { StudentRepository } from "@/core/student/student.repository";
import { StudentContextRepository } from "@/core/studentContext/studentContext.repository";
import { StudentContext } from "@/core/studentContext/studentContext.types";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const studentContextRouter = createTRPCRouter({
  upsertStudentContext: protectedProcedure
    .input(StudentContext.omit({ studentId: true }))
    .mutation(async ({ input, ctx }) => {
      const studentRepository = new StudentRepository(ctx.db);
      const studentId = await studentRepository.getStudentIdByUserIdOrThrow(
        ctx.session.user.id,
      );
      const studentContextRepository = new StudentContextRepository(ctx.db);
      return studentContextRepository.upsertStudentContext({
        ...input,
        studentId,
      });
    }),
  getStudentContext: protectedProcedure.query(async ({ ctx }) => {
    const studentRepository = new StudentRepository(ctx.db);
    const studentId = await studentRepository.getStudentIdByUserIdOrThrow(
      ctx.session.user.id,
    );
    const studentContextRepository = new StudentContextRepository(ctx.db);
    return studentContextRepository.getStudentContext(studentId);
  }),
});
