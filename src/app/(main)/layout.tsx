import { requireSession } from "@/server/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();
  return children;
}
