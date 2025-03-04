import type {
  Problem,
  ProblemQueryResult,
  ProblemUpload,
  ProblemUploadStatus,
} from "@/core/problem/types";
import type { Draft } from "@/core/utils";
import { db } from "@/server/db";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createId } from "@paralleldrive/cuid2";
import { Difficulty, Prisma, type PrismaClient } from "@prisma/client";
import assert from "assert";
import { z } from "zod";
import {
  type Concept,
  type ConceptWithGoal,
  type MasteryLevel,
} from "../concept/types";
import type { Goal } from "../goal/types";
import { Lesson, LessonTurn } from "../lesson/types";

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

  async getGoalById(id: string): Promise<Goal> {
    return this.db.goal.findUniqueOrThrow({ where: { id } });
  }

  async createGoal(userId: string, goalText: string): Promise<Goal> {
    return this.db.goal.create({ data: { name: goalText, userId } });
  }

  async getUserGoals(userId: string): Promise<Goal[]> {
    return this.db.goal.findMany({ where: { userId } });
  }

  async getConceptsByGoalId(goalId: string): Promise<Concept[]> {
    return this.db.concept.findMany({ where: { goalId } });
  }

  async getConceptById(id: string): Promise<Concept> {
    return this.db.concept.findUniqueOrThrow({ where: { id } });
  }

  async getConceptWithGoalByConceptId(id: string): Promise<ConceptWithGoal> {
    return this.db.concept.findUniqueOrThrow({
      where: { id },
      include: { goal: true },
    });
  }

  async createConcepts(concepts: Concept[]): Promise<void> {
    await this.db.concept.createMany({ data: concepts });
  }

  async updateConceptMasteryLevel(
    conceptId: string,
    masteryLevel: MasteryLevel,
  ) {
    return this.db.concept.update({
      where: { id: conceptId },
      data: { masteryLevel },
    });
  }
  async updateConceptMasteryLevelAndTeacherReport(
    conceptId: string,
    masteryLevel: MasteryLevel,
    teacherReport: string,
  ) {
    return this.db.concept.update({
      where: { id: conceptId },
      data: { masteryLevel, teacherReport },
    });
  }

  /**
   * Creates a new lesson
   * @param lessonGoal The goal of the lesson
   * @param conceptId The ID of the concept this lesson is for
   * @param goalId The ID of the parent goal
   * @param userId The ID of the user
   * @param lessonIterations The initial iterations for the lesson
   * @returns The created lesson
   */
  async createLesson(
    lessonGoal: string,
    conceptId: string,
    goalId: string,
    userId: string,
    problemId: string,
    turns: LessonTurn[],
    difficulty: Difficulty,
  ): Promise<Lesson> {
    const dbLesson = await this.db.lesson.create({
      data: {
        lessonGoal,
        conceptId,
        goalId,
        userId,
        problemId,
        turns,
        status: "TODO",
        difficulty,
      },
    });
    return Lesson.parse(dbLesson);
  }

  /**
   * Gets all lessons for a concept
   * @param conceptId The ID of the concept
   * @returns The lessons for the concept
   */
  async getLessonsByConceptId(conceptId: string): Promise<Lesson[]> {
    const lessons = await this.db.lesson.findMany({
      where: { conceptId },
      orderBy: { createdAt: "desc" },
    });
    return lessons.map((lesson) => ({
      ...lesson,
      turns: z.array(LessonTurn).parse(lesson.turns),
    }));
  }

  /**
   * Gets a lesson by ID
   * @param lessonId The ID of the lesson to get
   * @returns The lesson
   */
  async getLessonById(lessonId: string): Promise<Lesson> {
    const lesson = await this.db.lesson.findUniqueOrThrow({
      where: { id: lessonId },
    });
    return {
      ...lesson,
      turns: z.array(LessonTurn).parse(lesson.turns),
    };
  }

  /**
   * Updates a lesson with new iterations and optionally changes status
   * @param lessonId The ID of the lesson to update
   * @param lessonIterations The updated iterations for the lesson
   * @param status Optional new status for the lesson
   * @returns The updated lesson
   */
  async updateLesson(lesson: Lesson): Promise<Lesson> {
    const dbLesson = await this.db.lesson.update({
      where: { id: lesson.id },
      data: lesson,
    });
    return Lesson.parse(dbLesson);
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
    ("id", "problemUploadId", "dataSource", "problem", "solution", "level", "type", "vector") VALUES
    ${Prisma.join(
      problemsWithVectors.map(
        (problem) =>
          Prisma.sql`(${createId()}, ${problemUploadId}, ${problem.dataSource}, ${problem.problem}, ${problem.solution},
          ${problem.level}, ${problem.type}, ${JSON.stringify(problem.vector)}::vector)`,
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
        createdAt: Date;
        score: number;
      }[]
    >`SELECT "id", "dataSource", "problem", "solution", "level", "type", "createdAt",
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
        createdAt: result.createdAt,
      },
      score: result.score,
    }));
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
}

export const dbAdapter = new DBAdapter(db);
