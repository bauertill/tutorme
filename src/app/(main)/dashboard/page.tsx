import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Welcome to your Dashboard
        </h1>
        <div className="text-center">
          <p className="text-2xl">
            Logged in as: {session.user.name ?? session.user.email}
          </p>
        </div>
      </div>
    </main>
  );
}
