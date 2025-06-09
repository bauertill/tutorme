import type { Draft } from "@/core/utils";
import { type PrismaClient } from "@prisma/client";
import { type User } from "./user.types";

export class UserRepository {
  constructor(private db: PrismaClient) {}

  async getUserByEmail(email: string): Promise<User> {
    return await this.db.user.findUniqueOrThrow({ where: { email } });
  }

  async getOrCreateUserByAnonToken(anonToken: string): Promise<User> {
    const email = `${anonToken}@anon.tutormegood.com`;
    return await this.db.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        student: {
          create: {},
        },
      },
    });
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
