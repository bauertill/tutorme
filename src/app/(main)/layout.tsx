import { SessionProvider } from "next-auth/react";
import { StateSyncProvider } from "../_components/providers/StateSyncProvider";
import { UsageLimitOverlay } from "../_components/user/UsageLimitOverlay";
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <UsageLimitOverlay />
      <StateSyncProvider>{children}</StateSyncProvider>
    </SessionProvider>
  );
}
