import { parseStudentSolutionWithDefaults } from "@/core/problem/problemDomain";
import {
  Problem,
  type ProblemQueryResult,
  type ProblemUpload,
  type ProblemUploadStatus,
} from "@/core/problem/types";
import type { Draft } from "@/core/utils";
import { db } from "@/server/db";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createId } from "@paralleldrive/cuid2";
import { Prisma, type PrismaClient } from "@prisma/client";
import assert from "assert";
import { type AppUsage } from "../appUsage/types";
import {
  type GroupAssignment,
  type StudentAssignment,
  type StudentAssignmentWithStudentSolutions,
} from "../assignment/types";
import {
  type Subscription,
  type SubscriptionStatus,
} from "../subscription/types";
import { type User } from "../user/types";

const EMBEDDING_MODEL = "text-embedding-3-large";

export class DBAdapter {
  private embeddingModel: OpenAIEmbeddings;

  constructor(private db: PrismaClient) {
    this.embeddingModel = new OpenAIEmbeddings({
      modelName: EMBEDDING_MODEL,
    });
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return this.embeddingModel.embedDocuments(documents);
  }

  async embedQuery(query: string): Promise<number[]> {
    return this.embeddingModel.embedQuery(query);
  }

  async createProblemUpload(
    upload: Draft<ProblemUpload>,
  ): Promise<ProblemUpload> {
    const dbUpload = await this.db.problemUpload.create({ data: upload });
    return dbUpload;
  }

  async updateProblemUploadStatus(
    uploadId: string,
    data: {
      status: ProblemUploadStatus;
      error?: string;
    },
  ): Promise<ProblemUpload> {
    const dbUpload = await this.db.problemUpload.update({
      where: { id: uploadId },
      data,
    });
    return dbUpload;
  }

  async getProblemUploadStatusById(id: string): Promise<ProblemUploadStatus> {
    const dbUpload = await this.db.problemUpload.findUniqueOrThrow({
      where: { id },
    });
    return dbUpload.status;
  }

  async createProblems(
    problemUploadId: string,
    problems: Draft<Problem>[],
    searchStringFn: (problem: Draft<Problem>) => string,
  ): Promise<void> {
    const vectors = await this.embedDocuments(
      problems.map((problem) => searchStringFn(problem)),
    );
    assert(
      vectors.length === problems.length,
      "Problem vectors and problems must have the same length",
    );
    const problemsWithVectors = problems.map((problem, index) => ({
      ...problem,
      vector: vectors[index]!,
    }));

    await this.db.$executeRaw`INSERT INTO "Problem"
    ("id", "problemUploadId", "problem", "problemNumber", "referenceSolution", "vector") VALUES
    ${Prisma.join(
      problemsWithVectors.map(
        (problem) =>
          Prisma.sql`(${createId()}, ${problemUploadId}, ${problem.problem}, ${problem.problemNumber}, ${problem.referenceSolution}, ${JSON.stringify(problem.vector)}::vector)`,
      ),
    )}`;
  }

  async queryProblems(
    query: string,
    limit: number,
    problemIdBlackList: string[] = [],
    level?: string,
  ): Promise<ProblemQueryResult[]> {
    const queryVector = await this.embedQuery(query);
    const results = await this.db.$queryRaw<
      {
        id: string;
        problem: string;
        problemNumber: string;
        referenceSolution: string;
        createdAt: Date;
        updatedAt: Date;
        score: number;
      }[]
    >`SELECT "id", "problem", "problemNumber", "referenceSolution", "createdAt",
        1 - ("vector" <=> ${queryVector}::vector) as "score"
        FROM "Problem"
        WHERE "vector" IS NOT NULL
        AND "id" NOT IN (${Prisma.join([...problemIdBlackList, "NULL"])})
        ${level ? Prisma.sql`AND "level" = ${level}` : Prisma.empty}
        ORDER BY "score" DESC
        LIMIT ${limit}`;
    return results.map((result) => ({
      problem: {
        id: result.id,
        problem: result.problem,
        problemNumber: result.problemNumber,
        referenceSolution: result.referenceSolution,
        createdAt: result.createdAt,
        updatedAt: result.createdAt,
      },
      score: result.score,
    }));
  }

  async getRandomProblem(): Promise<Problem> {
    const [rawProblem] = await this.db.$queryRaw<unknown[]>`
      SELECT
      "id", "createdAt", "dataSource", "problem", "solution", "level", "type"
      FROM "Problem"
      WHERE "level" = 'Level 1'
      AND "problem" NOT ILIKE '%[asy]%'
      ORDER BY RANDOM() LIMIT 1
    `;
    const problem = Problem.parse(rawProblem);

    if (!problem) {
      throw new Error("No problem found");
    }

    return problem;
  }

  async getProblemUploadFiles(): Promise<ProblemUpload[]> {
    return this.db.problemUpload.findMany();
  }

  async deleteProblemUpload(uploadId: string): Promise<void> {
    await this.db.problemUpload.delete({ where: { id: uploadId } });
  }

  async getProblemUploadById(uploadId: string): Promise<ProblemUpload> {
    return this.db.problemUpload.findUniqueOrThrow({ where: { id: uploadId } });
  }

  async createProblem(
    problem: Draft<Problem>,
    userId: string,
  ): Promise<Problem> {
    const dbProblem = await this.db.problem.create({
      data: {
        ...problem,
        userId,
      },
    });
    return dbProblem;
  }

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

  async createStudentAssignmentWithProblems(
    {
      name,
      studentId,
      problems,
    }: {
      name: string;
      studentId: string;
      problems: Draft<Problem>[];
    },
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

  async getStudentAssignmentsByUserId(
    userId: string,
  ): Promise<StudentAssignmentWithStudentSolutions[]> {
    const dbAssignments = await this.db.studentAssignment.findMany({
      where: { userId },
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

  async getUsersByStudentGroupId(studentGroupId: string): Promise<User[]> {
    return await this.db.user.findMany({
      where: { student: { studentGroup: { some: { id: studentGroupId } } } },
    });
  }

  async getAppUsageByFingerprint(
    fingerprint: string,
  ): Promise<AppUsage | null> {
    return await this.db.appUsage.findUnique({
      where: { fingerprint },
    });
  }

  async createAppUsage(fingerprint: string): Promise<AppUsage> {
    return await this.db.appUsage.create({
      data: {
        fingerprint,
        creditsUsed: 0,
      },
    });
  }

  async updateAppUsageLastAccessed(id: string): Promise<AppUsage> {
    return await this.db.appUsage.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }

  async incrementAppUsageProblemCount(id: string): Promise<AppUsage> {
    return await this.db.appUsage.update({
      where: { id },
      data: {
        creditsUsed: {
          increment: 1,
        },
      },
    });
  }

  async upsertSubscriptionByUserId(
    userId: string,
    data: {
      status: SubscriptionStatus;
      stripeSubscriptionId: string;
      cancelAt: Date | null;
    },
  ) {
    return await this.db.subscription.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }

  async getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    return await this.db.subscription.findUnique({ where: { userId } });
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.db.user.findUniqueOrThrow({ where: { email } });
  }

  async getProblemsByUserId(userId: string): Promise<Problem[]> {
    const dbProblems = await this.db.problem.findMany({
      where: { userId },
    });
    return dbProblems;
  }

  async deleteAllProblemsAndAssignmentsByUserId(userId: string): Promise<void> {
    await this.db.$transaction([
      this.db.groupAssignment.deleteMany({ where: { userId } }),
      this.db.studentAssignment.deleteMany({ where: { userId } }),
      this.db.problem.deleteMany({ where: { userId } }),
    ]);
  }

  async getStudentIdByUserIdOrThrow(userId: string): Promise<string> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });
    if (!user?.student) {
      throw new Error("User does not have a student");
    }
    return user.student.id;
  }
}

export const dbAdapter = new DBAdapter(db);
