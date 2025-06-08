import { StudentSolution } from "@/core/studentSolution/studentSolution.types";
import { type PrismaClient } from "@prisma/client";

export class StudentSolutionRepository {
  constructor(private db: PrismaClient) {}

  async upsertStudentSolution(
    solution: StudentSolution,
  ): Promise<StudentSolution> {
    const dbSolution = await this.db.studentSolution.upsert({
      where: { id: solution.id },
      update: {
        ...solution,
        evaluation: solution.evaluation ?? undefined,
      },
      create: {
        ...solution,
        evaluation: solution.evaluation ?? undefined,
      },
    });
    return StudentSolution.parse(dbSolution);
  }

  async getStudentSolutionsByStudentId(
    studentId: string,
  ): Promise<StudentSolution[]> {
    const results = await this.db.studentSolution.findMany({
      where: { studentAssignment: { studentId } },
    });
    return results.map((s) => StudentSolution.parse(s));
  }
}
