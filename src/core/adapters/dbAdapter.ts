import { PrismaClient } from "@prisma/client";
import { Goal } from "../userGoal/types";
import { User } from "../user/types";

export class DBAdapter {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async getUserById(userId: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async createUser(email: string, name: string): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async getGoalByUserId(userId: number): Promise<Goal> {
    const goal = await this.prisma.goal.findFirst({
      where: {
        userId: userId,
      },
    });
    return Goal.parse(goal);
  }

  async createGoal(userId: number, goalText: string): Promise<Goal> {
    const goal = await this.prisma.goal.create({
      data: {
        userId,
        goal: goalText,
      },
    });

    return {
      id: goal.id,
      userId: goal.userId,
      goal: goal.goal,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }

  async getUserGoals(userId: number): Promise<Goal[]> {
    const goals = await this.prisma.goal.findMany({
      where: {
        userId: userId,
      },
    });
    return goals.map(goal => Goal.parse(goal));
  }
}
