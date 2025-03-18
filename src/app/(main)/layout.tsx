import { UsageLimitProvider } from "@/components/UsageLimitProvider";
import { SessionProvider } from "next-auth/react";
import { StateSyncProvider } from "../_components/StateSyncProvider";
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <UsageLimitProvider>
        <StateSyncProvider>{children}</StateSyncProvider>
      </UsageLimitProvider>
    </SessionProvider>
  );
}
