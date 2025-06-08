import { type PrismaClient } from "@prisma/client";
import { type Problem } from "../problem/problem.types";
import { parseStudentSolutionWithDefaults } from "../studentSolution/studentSolution.domain";
import { type Draft } from "../utils";
import {
  type GroupAssignment,
  type StudentAssignment,
  type StudentAssignmentWithStudentSolutions,
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

  async createStudentAssignmentWithProblems(
    {
      name,
      problems,
    }: {
      name: string;
      problems: Draft<Problem>[];
    },
    studentId: string,
    userId: string,
  ): Promise<StudentAssignment> {
    const dbAssignment = await this.db.studentAssignment.create({
      data: {
        name,
        userId,
        studentId,
        problems: {
          create: problems.map((problem) => ({
            ...problem,
            userId,
          })),
        },
      },
      include: { problems: true },
    });
    return dbAssignment;
  }

  async deleteGroupAssignmentById(assignmentId: string): Promise<void> {
    await this.db.groupAssignment.delete({
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
  ): Promise<StudentAssignmentWithStudentSolutions[]> {
    const dbAssignments = await this.db.studentAssignment.findMany({
      where: { studentId },
      include: { problems: true, studentSolutions: true },
    });
    return dbAssignments.map(
      ({ studentSolutions, problems, ...assignment }) => ({
        ...assignment,
        problems: problems.map((problem) => ({
          ...problem,
          assignmentId: assignment.id,
          studentSolution: parseStudentSolutionWithDefaults(
            studentSolutions.find(
              (solution) => solution.problemId === problem.id,
            ),
            problem.id,
            assignment.id,
          ),
        })),
      }),
    );
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

  async deleteAllProblemsAndAssignmentsByUserId(userId: string): Promise<void> {
    await this.db.$transaction([
      this.db.groupAssignment.deleteMany({ where: { userId } }),
      this.db.studentAssignment.deleteMany({ where: { userId } }),
      this.db.problem.deleteMany({ where: { userId } }),
    ]);
  }
}
