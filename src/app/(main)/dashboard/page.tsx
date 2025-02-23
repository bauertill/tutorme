import { UserAndSignOutButton } from "@/app/_components/UserAndSignOutButton";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { CreateGoalButton } from "../goal/_components/CreateGoalButton";
import { GoalsList } from "../goal/_components/GoalsList";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen p-8 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          Welcome to your Dashboard, {session.user.name ?? "User"}
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-end gap-4 mb-6">
            <UserAndSignOutButton session={session} />
          </div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium dark:text-white">
              Learning Goals
            </h3>
            <CreateGoalButton />
          </div>
          <GoalsList />
        </div>
      </div>
    </div>
  );
}
