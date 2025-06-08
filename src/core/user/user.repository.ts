import type { Draft } from "@/core/utils";
import { type PrismaClient } from "@prisma/client";
import { type User } from "./user.types";

export class UserRepository {
  constructor(private db: PrismaClient) {}

  async getUserByEmail(email: string): Promise<User> {
    return await this.db.user.findUniqueOrThrow({ where: { email } });
  }

  async createUser(data: Draft<User>): Promise<User> {
    return await this.db.user.create({
      data: {
        ...data,
        student: {
          create: {},
        },
      },
    });
  }
}
