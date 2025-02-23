import { requireSession } from "@/server/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();
  return <div className="p-4">{children}</div>;
}
