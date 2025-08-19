import {
  Canvas as CanvasSchema,
  type Canvas,
} from "@/core/canvas/canvas.types";
import { StudentSolution } from "@/core/studentSolution/studentSolution.types";
import { Prisma, type PrismaClient } from "@prisma/client";

export class StudentSolutionRepository {
  constructor(private db: PrismaClient) {}

  private normalizeCanvas<T extends { canvas: unknown }>(
    record: T,
  ): Omit<T, "canvas"> & { canvas: Canvas } {
    const rawCanvas = record.canvas;
    const parsedCanvas =
      typeof rawCanvas === "string"
        ? CanvasSchema.parse(JSON.parse(rawCanvas))
        : CanvasSchema.parse(rawCanvas);
    return { ...(record as Omit<T, "canvas">), canvas: parsedCanvas };
  }

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
        ...(props.status === "SOLVED" ? { completedAt: new Date() } : {}),
        evaluation:
          props.evaluation === null ? Prisma.JsonNull : props.evaluation,
      },
    });
    const normalized = this.normalizeCanvas(result);
    return StudentSolution.parse(normalized);
  }

  async upsertStudentSolution(
    studentSolutionId: string,
    userId: string,
    problemId: string,
    props: Partial<Omit<StudentSolution, "id" | "problemId">>,
  ): Promise<StudentSolution> {
    const { userId: _, messages: __, evaluation: ___, ...data } = props;
    const result = await this.db.studentSolution.upsert({
      where: {
        id: studentSolutionId,
      },
      update: {
        ...data,
        ...(props.status === "SOLVED" ? { completedAt: new Date() } : {}),
        evaluation:
          props.evaluation === null ? Prisma.JsonNull : props.evaluation,
      },
      create: {
        ...data,
        evaluation:
          props.evaluation === null ? Prisma.JsonNull : props.evaluation,
        userId: userId,
        problemId: problemId,
      },
    });
    const normalized = this.normalizeCanvas(result);
    return StudentSolution.parse(normalized);
  }
  async getStudentSolutionsByUserId(
    userId: string,
  ): Promise<StudentSolution[]> {
    const results = await this.db.studentSolution.findMany({
      where: { userId },
    });
    return results.map((s) => StudentSolution.parse(this.normalizeCanvas(s)));
  }
}
