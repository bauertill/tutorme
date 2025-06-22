import { SessionProvider } from "@/lib/react-auth";
import { UsageLimitOverlay } from "../_components/user/UsageLimitOverlay";
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <UsageLimitOverlay />
      {children}
    </SessionProvider>
  );
}
