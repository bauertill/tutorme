import { type DBAdapter } from "../adapters/dbAdapter";

const MAX_FREE_CREDITS = 3;
const MAX_FREE_CREDITS_SIGNED_IN = 10;

export async function isValidFreeTierUsage(
  dbAdapter: DBAdapter,
  userId: string | undefined,
  ipAddress: string,
): Promise<boolean> {
  const isSignedIn = !!userId;
  const fingerprint = isSignedIn ? userId : ipAddress;

  const appUsage = await dbAdapter.getAppUsageByFingerprint(fingerprint);

  if (!appUsage) {
    await dbAdapter.createAppUsage(fingerprint);
    return true;
  }

  const maxFreeCredits = isSignedIn
    ? MAX_FREE_CREDITS_SIGNED_IN
    : MAX_FREE_CREDITS;
  if (appUsage.creditsUsed > maxFreeCredits) {
    return false;
  }

  await dbAdapter.incrementAppUsageProblemCount(appUsage.id);
  return true;
}
