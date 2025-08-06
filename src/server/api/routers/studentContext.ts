import { StudentRepository } from "@/core/student/student.repository";
import { StudentContextRepository } from "@/core/studentContext/studentContext.repository";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const studentContextRouter = createTRPCRouter({
  upsertStudentContext: protectedProcedure
    .input(
      z.object({
        grade: z.enum(["8", "9", "10", "11", "12"]),
        country: z.enum([
          "us",
          "uk",
          "ca",
          "au",
          "de",
          "fr",
          "es",
          "nl",
          "other",
        ]),
        textbook: z.string(),
        nextTestDate: z.date().optional(),
      }),
    )
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
