import { StudentContext } from "@/core/studentContext/studentContext.types";
import { type PrismaClient } from "@prisma/client";

export class StudentContextRepository {
  constructor(private db: PrismaClient) {}

  async upsertStudentContext(
    studentContext: StudentContext,
  ): Promise<StudentContext> {
    const result = await this.db.studentContext.upsert({
      where: { studentId: studentContext.studentId },
      create: studentContext,
      update: studentContext,
    });
    return StudentContext.parse(result);
  }

  async getStudentContext(studentId: string): Promise<StudentContext | null> {
    const result = await this.db.studentContext.findUnique({
      where: { studentId },
    });
    if (!result) return null;
    return StudentContext.parse(result);
  }
}
