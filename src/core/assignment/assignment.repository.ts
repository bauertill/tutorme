import { type PrismaClient } from "@prisma/client";
import { type Problem } from "../problem/problem.types";
import { type Draft } from "../utils";
import {
  type GroupAssignment,
  type StudentAssignment,
} from "./assignment.types";

export class AssignmentRepository {
  constructor(private db: PrismaClient) {}

  async createGroupAssignment(
    {
      id,
      name,
      problemIds,
      studentGroupId,
    }: {
      id: string;
      name: string;
      problemIds: string[];
      studentGroupId: string;
    },
    userId: string,
  ): Promise<GroupAssignment> {
    const dbAssignment = await this.db.groupAssignment.create({
      data: {
        id,
        name,
        userId,
        studentGroupId,
        problems: {
          connect: problemIds.map((id) => ({ id })),
        },
      },
      include: { problems: true, studentGroup: true },
    });
    return dbAssignment;
  }

  async createStudentAssignment(
    {
      id,
      name,
      problemIds,
      studentId,
    }: {
      id: string;
      name: string;
      problemIds: string[];
      studentId: string;
    },
    userId: string,
  ): Promise<StudentAssignment> {
    const dbAssignment = await this.db.studentAssignment.create({
      data: {
        id,
        name,
        userId,
        studentId,
        problems: {
          connect: problemIds.map((id) => ({ id })),
        },
      },
      include: { problems: true },
    });
    return dbAssignment;
  }
  async createStudentAssignmentForExistingProblems(
    {
      id,
      name,
      problemIds,
    }: {
      id: string;
      name: string;
      problemIds: string[];
    },
    studentId: string,
    userId: string,
  ): Promise<StudentAssignment> {
    const dbAssignment = await this.db.studentAssignment.create({
      data: {
        id,
        name,
        userId,
        studentId,
        problems: {
          connect: problemIds.map((id) => ({ id })),
        },
      },
      include: { problems: true },
    });
    return dbAssignment;
  }

  async createStudentAssignmentWithProblems(
    {
      id,
      name,
      problems,
    }: {
      id: string;
      name: string;
      problems: Draft<Problem>[];
    },
    studentId: string,
    userId: string,
    studentConceptId?: string,
  ): Promise<StudentAssignment> {
    const result = await this.db.$transaction(async (tx) => {
      const createdProblems = await Promise.all(
        problems.map((problem) =>
          tx.problem.create({
            data: {
              ...problem,
              userId,
            },
          }),
        ),
      );
      return tx.studentAssignment.create({
        data: {
          id,
          name,
          userId,
          studentId,
          studentConceptId,
          problems: {
            connect: createdProblems.map((problem) => ({ id: problem.id })),
          },
        },
        include: {
          problems: true,
        },
      });
    });
    return result;
  }

  async addProblemsToStudentAssignment(
    assignmentId: string,
    problems: Draft<Problem>[],
    userId: string,
  ): Promise<{ createdProblemIds: string[] }> {
    const created = await this.db.$transaction(async (tx) => {
      const createdProblems = await Promise.all(
        problems.map((problem) =>
          tx.problem.create({
            data: {
              ...problem,
              userId,
            },
          }),
        ),
      );
      await tx.studentAssignment.update({
        where: { id: assignmentId },
        data: {
          problems: {
            connect: createdProblems.map((p) => ({ id: p.id })),
          },
        },
      });
      return createdProblems.map((p) => p.id);
    });
    return { createdProblemIds: created };
  }

  async deleteGroupAssignmentById(assignmentId: string): Promise<void> {
    await this.db.groupAssignment.delete({
      where: {
        id: assignmentId,
      },
    });
  }

  async deleteStudentAssignmentById(assignmentId: string): Promise<void> {
    await this.db.studentAssignment.delete({
      where: {
        id: assignmentId,
      },
    });
  }

  async updateGroupAssignmentName(
    assignmentId: string,
    name: string,
  ): Promise<void> {
    await this.db.groupAssignment.update({
      where: { id: assignmentId },
      data: { name },
    });
  }

  async updateStudentAssignmentName(
    assignmentId: string,
    name: string,
  ): Promise<void> {
    await this.db.studentAssignment.update({
      where: { id: assignmentId },
      data: { name },
    });
  }

  async deleteAllStudentAssignmentsByUserId(userId: string): Promise<void> {
    await this.db.studentAssignment.deleteMany({
      where: { userId },
    });
  }

  async getGroupAssignmentsByUserId(
    userId: string,
  ): Promise<GroupAssignment[]> {
    const dbAssignments = await this.db.groupAssignment.findMany({
      where: { userId },
      include: { problems: true, studentGroup: true },
    });
    return dbAssignments;
  }

  async getStudentAssignmentsByStudentId(
    studentId: string,
  ): Promise<StudentAssignment[]> {
    const dbAssignments = await this.db.studentAssignment.findMany({
      where: { studentId },
      include: { problems: true },
    });
    return dbAssignments.map(({ problems, ...assignment }) => ({
      ...assignment,
      problems: problems.map((problem) => ({
        ...problem,
        assignmentId: assignment.id,
      })),
    }));
  }

  async getStudentAssignmentById(
    assignmentId: string,
  ): Promise<StudentAssignment | null> {
    const dbAssignment = await this.db.studentAssignment.findUnique({
      where: { id: assignmentId },
      include: { problems: true },
    });
    return dbAssignment;
  }

  async getDailyProgress(
    studentAssignmentId: string,
  ): Promise<{ remaining: number }> {
    const assignment = await this.db.studentAssignment.findUnique({
      where: { id: studentAssignmentId },
      include: {
        problems: true,
        studentSolutions: {
          where: {
            status: "SOLVED",
          },
        },
      },
    });

    if (!assignment) {
      return { remaining: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayProblemIds = new Set(
      assignment.problems
        .filter((p) => {
          const createdAt = new Date(p.createdAt);
          return createdAt >= today && createdAt < tomorrow;
        })
        .map((p) => p.id),
    );

    const solvedToday = assignment.studentSolutions.filter((s) =>
      todayProblemIds.has(s.problemId),
    ).length;

    const totalToday = todayProblemIds.size;
    const remaining = Math.max(0, totalToday - solvedToday);

    return { remaining };
  }

  async deleteAllProblemsAndAssignmentsByUserId(userId: string): Promise<void> {
    await this.db.$transaction([
      this.db.groupAssignment.deleteMany({ where: { userId } }),
      this.db.studentAssignment.deleteMany({ where: { userId } }),
      this.db.problem.deleteMany({ where: { userId } }),
    ]);
  }
}
