"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { CreateGoalButton } from "@/components/CreateGoalButton";
import { SignOutButton } from "@/components/auth/SignOutButton";
import LearningGoalsList from "@/components/LearningGoalsList";

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/");
    },
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen p-8 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user?.email) {
    redirect("/");
  }

  return (
    <div className="min-h-screen p-8 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          Welcome to your Dashboard, {session.user?.name}
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-end gap-4 mb-6">
            <SignOutButton />
          </div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium dark:text-white">
              Learning Goals
            </h3>
            <CreateGoalButton email={session.user.email} />
          </div>
          <LearningGoalsList email={session.user.email} />
        </div>
      </div>
    </div>
  );
}
