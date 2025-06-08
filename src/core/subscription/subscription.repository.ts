import { type PrismaClient } from "@prisma/client";
import {
  type Subscription,
  type SubscriptionStatus,
} from "./subscription.types";

export class SubscriptionRepository {
  constructor(private db: PrismaClient) {}

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
}
