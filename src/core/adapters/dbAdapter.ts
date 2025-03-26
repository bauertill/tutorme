import {
  Problem,
  type ProblemQueryResult,
  type ProblemUpload,
  type ProblemUploadStatus,
} from "@/core/problem/types";
import type { Draft } from "@/core/utils";
import { type Language } from "@/i18n/types";
import { db } from "@/server/db";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createId } from "@paralleldrive/cuid2";
import {
  Prisma,
  type PrismaClient,
  type UserProblem as UserProblemDB,
} from "@prisma/client";
import assert from "assert";
import { type AppUsage } from "../appUsage/types";
import {
  Canvas,
  EvaluationResult,
  ImageRegion,
  type Assignment,
  type UserProblem,
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
    ("id", "problemUploadId", "dataSource", "problem", "solution", "level", "type", "language", "vector") VALUES
    ${Prisma.join(
      problemsWithVectors.map(
        (problem) =>
          Prisma.sql`(${createId()}, ${problemUploadId}, ${problem.dataSource}, ${problem.problem}, ${problem.solution},
          ${problem.level}, ${problem.type}, ${problem.language}::"Language", ${JSON.stringify(problem.vector)}::vector)`,
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
        dataSource: string;
        problem: string;
        solution: string;
        level: string;
        type: string;
        language: Language;
        createdAt: Date;
        score: number;
      }[]
    >`SELECT "id", "dataSource", "problem", "solution", "level", "type", "language", "createdAt",
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
        dataSource: result.dataSource,
        problem: result.problem,
        solution: result.solution,
        level: result.level,
        type: result.type,
        language: result.language,
        createdAt: result.createdAt,
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

  async getProblems(
    language: Language,
    level: string,
    limit: number,
  ): Promise<Problem[]> {
    return this.db.problem.findMany({
      where: { language, level },
      take: limit,
      orderBy: { createdAt: "asc" },
    });
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

  async createUserProblems(
    problems: Draft<UserProblem>[],
    userId: string,
  ): Promise<void> {
    for (const problem of problems) {
      await this.createUserProblem(problem, userId);
    }
  }

  async createUserProblem(
    problem: Draft<UserProblem>,
    userId: string,
  ): Promise<UserProblem> {
    const existingProblem = await this.db.userProblem.findFirst({
      where: {
        userId,
        problem: problem.problem,
      },
    });

    if (!existingProblem) {
      const dbProblem = await this.db.userProblem.create({
        data: {
          ...problem,
          userId,
          canvas: { paths: [] },
          evaluation: undefined,
          relevantImageSegment: problem.relevantImageSegment ?? undefined,
        },
      });
      return parseProblem(dbProblem);
    }
    return parseProblem(existingProblem);
  }

  async updateUserProblems(
    problems: UserProblem[],
    userId: string,
    assignmentId: string,
  ): Promise<void> {
    await this.db.$transaction(
      problems.map((cur) =>
        this.db.userProblem.upsert({
          where: { id: cur.id },
          update: {
            ...cur,
            canvas: cur.canvas,
            evaluation: cur.evaluation ?? undefined,
            relevantImageSegment: cur.relevantImageSegment ?? undefined,
          },
          create: {
            ...cur,
            canvas: cur.canvas,
            evaluation: cur.evaluation ?? undefined,
            userId,
            assignmentId,
            relevantImageSegment: cur.relevantImageSegment ?? undefined,
          },
        }),
      ),
    );
  }

  async createAssignment(
    assignment: Assignment,
    userId: string,
  ): Promise<Assignment> {
    const { problems, ...rest } = assignment;

    const dbAssignment = await this.db.assignment.create({
      data: {
        ...rest,
        userId,
      },
    });

    const createdProblems: UserProblem[] = [];
    for (const problem of problems) {
      const createdProblem = await this.createUserProblem(
        {
          ...problem,
          assignmentId: dbAssignment.id,
        },
        userId,
      );
      createdProblems.push(createdProblem);
    }

    return {
      ...dbAssignment,
      problems: createdProblems,
    };
  }
  async deleteAssignmentById(assignmentId: string): Promise<void> {
    await this.db.assignment.delete({
      where: {
        id: assignmentId,
      },
    });
  }

  async deleteAllAssignments(userId: string): Promise<void> {
    await this.db.assignment.deleteMany({
      where: { userId },
    });
  }

  async getAssignmentsByUserId(userId: string): Promise<Assignment[]> {
    const dbAssignments = await this.db.assignment.findMany({
      where: { userId },
      include: { problems: true },
    });

    return dbAssignments.map((assignment) => ({
      ...assignment,
      problems: assignment.problems.map((problem) => parseProblem(problem)),
    }));
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
}

const parseProblem = (problem: UserProblemDB): UserProblem => ({
  ...problem,
  canvas: Canvas.parse(problem.canvas),
  evaluation: EvaluationResult.safeParse(problem.evaluation).data ?? null,
  relevantImageSegment:
    ImageRegion.safeParse(problem.relevantImageSegment).data ?? null,
});

export const dbAdapter = new DBAdapter(db);
