import { PrismaClient } from "@prisma/client";
import { Goal, User } from "../userGoal/types";

export class DBAdapter {
  private prisma: PrismaClient;

  constructor() {
    try {
      this.prisma = new PrismaClient();
    } catch (e) {
      console.error("Error connecting to database", e);
    }
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
}
