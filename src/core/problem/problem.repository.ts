import { type Language } from "@/i18n/types";
import { Prisma, type PrismaClient } from "@prisma/client";
import { embeddingAdapter } from "../adapters/embeddingAdapter";
import { type Problem, type ProblemQueryResult } from "./problem.types";

export class ProblemRepository {
  constructor(private db: PrismaClient) {}

  async getProblemsByUserId(userId: string): Promise<Problem[]> {
    const dbProblems = await this.db.problem.findMany({
      where: {
        studentSolutions: {
          some: { userId },
        },
      },
    });
    return dbProblems;
  }

  async queryProblems(
    query: string,
    limit: number,
    problemIdBlackList: string[] = [],
    level?: string,
  ): Promise<ProblemQueryResult[]> {
    const queryVector = await embeddingAdapter.embedQuery(query);
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

  async getExampleProblems(language: Language): Promise<Problem[]> {
    let exampleProblems: Problem[] = [];
    if (language === "en") {
      exampleProblems = [
        {
          id: `example-problem-1-${language}`,
          problem:
            "Ivan rents a car for €25 a day and €0.20 a mile. If he rents it for 4 days and drives it 400 miles, how many euros does he pay?",
          problemNumber: "1",
          referenceSolution: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: `example-problem-2-${language}`,
          problem: "What is the value of $(2x + 5)^2$ when $x = 3$?",
          problemNumber: "2",
          referenceSolution: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: `example-problem-3-${language}`,
          problem:
            "The function $f(x)$ is defined by $f(x)=x^{2}-x$. What is the value of $f(4)$?",
          problemNumber: "3",
          referenceSolution: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }
    if (language === "de") {
      exampleProblems = [
        {
          id: `example-problem-1-${language}`,
          problem:
            "Ivan mietet einen Auto für €25 pro Tag und €0.20 pro Meile. Wenn er ihn für 4 Tage mietet und 400 Meilen fährt, wie viel Euro zahlt er?",
          problemNumber: "1",
          referenceSolution: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: `example-problem-2-${language}`,
          problem: "Was ist der Wert von $(2x + 5)^2$ wenn $x = 3$?",
          problemNumber: "2",
          referenceSolution: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: `example-problem-3-${language}`,
          problem:
            "Die Funktion $f(x)$ ist definiert durch $f(x)=x^{2}-x$. Was ist der Wert von $f(4)$?",
          problemNumber: "3",
          referenceSolution: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }
    const exampleProblemsInDB = await this.db.problem.findMany({
      where: {
        id: {
          in: exampleProblems.map((problem) => problem.id),
        },
      },
    });
    if (exampleProblemsInDB.length === 0) {
      await this.db.problem.createMany({
        data: exampleProblems.map((problem) => ({
          ...problem,
        })),
      });
      return exampleProblems;
    }
    return exampleProblemsInDB;
  }
}
