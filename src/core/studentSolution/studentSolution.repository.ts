import { StudentSolution } from "@/core/studentSolution/studentSolution.types";
import { type PrismaClient } from "@prisma/client";

export class StudentSolutionRepository {
  constructor(private db: PrismaClient) {}

  async updateStudentSolution(
    studentAssignmentId: string,
    problemId: string,
    props: Partial<StudentSolution>,
  ) {
    const result = await this.db.studentSolution.update({
      where: {
        problemId_studentAssignmentId: { studentAssignmentId, problemId },
      },
      data: {
        ...props,
        evaluation: props.evaluation ?? undefined,
      },
    });
    return StudentSolution.parse(result);
  }

  async upsertStudentSolution(
    studentAssignmentId: string,
    problemId: string,
    props: Partial<
      Omit<StudentSolution, "id" | "studentAssignmentId" | "problemId">
    >,
  ): Promise<StudentSolution> {
    const result = await this.db.studentSolution.upsert({
      where: {
        problemId_studentAssignmentId: { studentAssignmentId, problemId },
      },
      update: {
        ...props,
        evaluation: props.evaluation ?? undefined,
      },
      create: {
        studentAssignmentId,
        problemId,
        ...props,
        canvas: props.canvas ?? { paths: [] },
        evaluation: props.evaluation ?? undefined,
      },
    });
    return StudentSolution.parse(result);
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
