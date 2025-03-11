import { SessionProvider } from "next-auth/react";
import { StateSyncProvider } from "../_components/StateSyncProvider";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <StateSyncProvider>{children}</StateSyncProvider>
    </SessionProvider>
  );
}
