import { StudentSolution } from "@/core/studentSolution/studentSolution.types";
import { Prisma, type PrismaClient } from "@prisma/client";

export class StudentSolutionRepository {
  constructor(private db: PrismaClient) {}

  async updateStudentSolution(
    studentSolutionId: string,
    props: Partial<
      Omit<StudentSolution, "id" | "studentAssignmentId" | "problemId">
    >,
  ): Promise<StudentSolution> {
    const result = await this.db.studentSolution.update({
      where: { id: studentSolutionId },
      data: {
        ...props,
        evaluation:
          props.evaluation === null ? Prisma.JsonNull : props.evaluation,
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
        evaluation:
          props.evaluation === null ? Prisma.JsonNull : props.evaluation,
      },
      create: {
        studentAssignmentId,
        problemId,
        ...props,
        canvas: props.canvas ?? { paths: [] },
        recommendedQuestions: props.recommendedQuestions ?? [],
        evaluation: props.evaluation ?? Prisma.JsonNull,
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
