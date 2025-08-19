"use client";

import { UserAndSignOutButton } from "@/app/_components/user/UserAndSignOutButton";
import { useAuth } from "@/lib/react-auth";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { AssignmentPreview } from "./_components/AssignmentPreview";
import { ConceptsList } from "./_components/ConceptsList";
import { DailyStreak } from "./_components/DailyStreak";
import { League } from "./_components/League";

export function Home() {
  const { session } = useAuth();
  const userName = session?.user?.name ?? "User";
  useRouter();

  api.useUtils();

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome, {userName}
            {session?.user && <UserAndSignOutButton user={session?.user} />}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to continue your learning journey?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column - Progress */}
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Your Progress
              </h2>
              <DailyStreak />
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Jump back in
              </h2>
              <League />
            </div>
          </div>

          {/* Right Column - Assignments and Learning Goals */}
          <div className="space-y-8">
            {/* Next Lesson Section */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Next Lesson
              </h2>
              <AssignmentPreview />
            </div>

            {/* Learning Goals Section */}
            <div>
              <ConceptsList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
