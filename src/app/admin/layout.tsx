import { requireAdminSession } from "@/server/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();
  return <div className="p-4">{children}</div>;
}
