import { type PrismaClient } from "@prisma/client";
import * as subscription from "../subscription/subscription.domain";
import { AppUsageRepository } from "./appUsage.repository";

const MAX_FREE_CREDITS = 20;
const MAX_FREE_CREDITS_SIGNED_IN = 60;

export async function isValidFreeTierUsage(
  db: PrismaClient,
  userId: string | undefined,
  ipAddress: string,
): Promise<boolean> {
  const repository = new AppUsageRepository(db);
  const isSignedIn = !!userId;

  const isSubscribed =
    isSignedIn && (await subscription.isSubscribed(userId, db));
  if (isSubscribed) return true;

  const fingerprint = isSignedIn ? userId : ipAddress;

  const appUsage = await repository.getAppUsageByFingerprint(fingerprint);

  if (!appUsage) {
    await repository.createAppUsage(fingerprint);
    return true;
  }

  const maxFreeCredits = isSignedIn
    ? MAX_FREE_CREDITS_SIGNED_IN
    : MAX_FREE_CREDITS;
  if (appUsage.creditsUsed > maxFreeCredits) {
    return false;
  }

  await repository.incrementAppUsageProblemCount(appUsage.id);
  return true;
}
