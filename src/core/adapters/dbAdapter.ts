import { PrismaClient } from "@prisma/client";
import { Concept, ConceptWithGoal, Goal } from "../goal/types";
import { User } from "../user/types";
import { Question, Quiz } from "../concept/types";

export class DBAdapter {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return User.parse(user);
  }

  async createUser(email: string, name: string): Promise<User> {
    const data = { name, email };
    return await this.prisma.user.create({ data });
  }

  async getGoalById(id: string): Promise<Goal> {
    const goal = await this.prisma.goal.findFirst({
      where: { id },
    });
    return Goal.parse(goal);
  }

  async createGoal(userId: number, goalText: string): Promise<Goal> {
    const data = { userId, goal: goalText };
    return await this.prisma.goal.create({ data });
  }

  async getUserGoals(userId: number): Promise<Goal[]> {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
    });
    return goals.map(goal => Goal.parse(goal));
  }

  async getConceptsByGoalId(goalId: string): Promise<Concept[]> {
    const concepts = await this.prisma.concept.findMany({
      where: { goalId },
    });
    return concepts.map(concept => Concept.parse(concept));
  }

  async getConceptWithGoalByConceptId(id: string): Promise<ConceptWithGoal> {
    const concept = await this.prisma.concept.findUnique({
      where: { id },
      include: {
        goal: true,
      },
    });
    return ConceptWithGoal.parse(concept);
  }

  async createConcepts(concepts: Concept[]): Promise<void> {
    await this.prisma.concept.createMany({ data: concepts });
  }

  async createQuiz(questions: Question[], conceptId: string): Promise<Quiz> {
    console.log("Creating quiz for concept:", conceptId, questions);
    const quiz = await this.prisma.quiz.create({
      data: {
        conceptId,
        questions: {
          create: questions,
        },
      },
      include: {
        questions: true,
      },
    });
    return {
      id: quiz.id,
      conceptId: quiz.conceptId,
      questions,
    };
  }
}
