import { type PrismaClient } from "@prisma/client";
import { type AppUsage } from "./appUsage.types";

export class AppUsageRepository {
  constructor(private db: PrismaClient) {}

  async getAppUsageByFingerprint(
    fingerprint: string,
  ): Promise<AppUsage | null> {
    return await this.db.appUsage.findUnique({
      where: { fingerprint },
    });
  }

  async createAppUsage(fingerprint: string): Promise<AppUsage> {
    return await this.db.appUsage.create({
      data: {
        fingerprint,
        creditsUsed: 0,
      },
    });
  }

  async incrementAppUsageProblemCount(id: string): Promise<AppUsage> {
    return await this.db.appUsage.update({
      where: { id },
      data: {
        creditsUsed: {
          increment: 1,
        },
      },
    });
  }
}
