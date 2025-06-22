import { type Problem } from "@/core/problem/problem.types";
import {
  type ProblemUpload,
  type ProblemUploadStatus,
} from "@/core/problemUpload/problemUpload.types";
import type { Draft } from "@/core/utils";
import { createId } from "@paralleldrive/cuid2";
import { Prisma, type PrismaClient } from "@prisma/client";
import assert from "assert";
import { embeddingAdapter } from "../adapters/embeddingAdapter";

export class ProblemUploadRepository {
  constructor(private db: PrismaClient) {}

  async getProblemUploadStatusById(id: string): Promise<ProblemUploadStatus> {
    const dbUpload = await this.db.problemUpload.findUniqueOrThrow({
      where: { id },
    });
    return dbUpload.status;
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

  async createProblems(
    problemUploadId: string,
    problems: Draft<Problem>[],
    searchStringFn: (problem: Draft<Problem>) => string,
  ): Promise<void> {
    const vectors = await embeddingAdapter.embedDocuments(
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
