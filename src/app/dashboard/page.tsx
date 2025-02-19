import { DBAdapter } from "@/core/adapters/dbAdapter";
import { notFound } from "next/navigation";
import LearningGoalsList from "@/components/LearningGoalsList";
import CreateGoalButton from "@/components/CreateGoalButton";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ userId: string }>;
}) {
  const { userId } = await searchParams;
  if (!userId) {
    notFound();
  }

  const db = new DBAdapter();
  const user = await db.getUserById(parseInt(userId));
  const goals = await db.getUserGoals(parseInt(userId));

  if (!user) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8 dark:bg-gray-900">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Learning Goals</h1>
          <CreateGoalButton userId={parseInt(userId)} />
        </div>
        <LearningGoalsList goals={goals} />
      </div>
    </main>
  );
}
