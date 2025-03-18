import { SessionProvider } from "next-auth/react";
import { StateSyncProvider } from "../_components/StateSyncProvider";
import { UsageLimitOverlay } from "../_components/UsageLimitOverlay";
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
