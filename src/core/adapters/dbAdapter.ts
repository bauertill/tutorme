import { db } from "@/server/db";
import type { PrismaClient } from "@prisma/client";
import type {
  Question,
  QuestionParams,
  QuestionResponseWithQuestion,
  Quiz,
  UserQuestionResponse,
} from "../concept/types";
import type {
  Concept,
  ConceptWithGoal,
  Goal,
  MasteryLevel,
} from "../goal/types";

export class DBAdapter {
  constructor(private db: PrismaClient) {}

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

  async getConceptWithGoalByConceptId(id: string): Promise<ConceptWithGoal> {
    return this.db.concept.findUniqueOrThrow({
      where: { id },
      include: { goal: true },
    });
  }

  async createConcepts(concepts: Concept[]): Promise<void> {
    await this.db.concept.createMany({ data: concepts });
  }

  async createQuiz(
    questions: QuestionParams[],
    conceptId: string,
  ): Promise<Quiz> {
    return this.db.quiz.create({
      data: {
        conceptId,
        questions: { create: questions },
      },
      include: { questions: true },
    });
  }

  async getQuestionById(id: string): Promise<Question | null> {
    return this.db.question.findUniqueOrThrow({ where: { id } });
  }

  async getQuestionResponsesByUserIdConceptId(
    userId: string,
    conceptId: string,
  ): Promise<QuestionResponseWithQuestion[]> {
    return this.db.userQuestionResponse.findMany({
      where: { userId, conceptId },
      include: { question: true },
    });
  }

  async createQuestionResponse(response: UserQuestionResponse) {
    return this.db.userQuestionResponse.create({ data: response });
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
}

export const dbAdapter = new DBAdapter(db);
