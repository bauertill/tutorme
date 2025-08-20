import {
  Canvas as CanvasSchema,
  type Canvas,
} from "@/core/canvas/canvas.types";
import { type Problem } from "@/core/problem/problem.types";
import { StudentSolution } from "@/core/studentSolution/studentSolution.types";
import { Prisma, type PrismaClient } from "@prisma/client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
    props: Partial<Omit<StudentSolution, "id" | "problemId" | "userId">>,
  ): Promise<StudentSolution> {
    const result = await this.db.studentSolution.update({
      where: { id: studentSolutionId },
      data: {
        ...props,
        ...(props.status === "SOLVED" ? { completedAt: new Date() } : {}),
        evaluation:
          props.evaluation === null ? Prisma.JsonNull : props.evaluation,
      } as any,
      include: {
        messages: true,
      },
    });
    const normalized = this.normalizeCanvas(result);
    return StudentSolution.parse(normalized);
  }

  async upsertStudentSolution(
    userId: string,
    problemId: string,
    props: Partial<Omit<StudentSolution, "id" | "problemId" | "userId">>,
  ): Promise<StudentSolution> {
    const result = await this.db.studentSolution.upsert({
      where: {
        problemId_userId: { problemId, userId },
      } as any,
      update: {
        ...props,
        ...(props.status === "SOLVED" ? { completedAt: new Date() } : {}),
        evaluation:
          props.evaluation === null ? Prisma.JsonNull : props.evaluation,
      } as any,
      create: {
        userId,
        problemId,
        ...props,
        ...(props.status === "SOLVED" ? { completedAt: new Date() } : {}),
        canvas: props.canvas ?? { paths: [] },
        recommendedQuestions: props.recommendedQuestions ?? [],
        evaluation: props.evaluation ?? Prisma.JsonNull,
      } as any,
      include: {
        messages: true,
      },
    });
    const normalized = this.normalizeCanvas(result);
    return StudentSolution.parse(normalized);
  }

  async getStudentSolutionsByUserId(
    userId: string,
  ): Promise<StudentSolution[]> {
    const results = await this.db.studentSolution.findMany({
      where: { userId } as any,
      include: {
        messages: true,
      },
    });
    return results.map((s) => StudentSolution.parse(this.normalizeCanvas(s)));
  }

  async getSolvedProblems(
    userId: string,
    conceptId: string,
  ): Promise<Problem[]> {
    const solutions = await this.db.studentSolution.findMany({
      where: {
        userId,
        status: "SOLVED",
        problem: {
          conceptId,
        },
      } as any,
      include: {
        problem: true,
        messages: true,
      },
    });

    return solutions.map((s) => s.problem);
  }

  async getAllSolvedProblems(userId: string): Promise<Problem[]> {
    const solutions = await this.db.studentSolution.findMany({
      where: {
        userId,
        status: "SOLVED",
      } as any,
      include: {
        problem: true,
        messages: true,
      },
    });

    return solutions.map((s) => s.problem);
  }
}
