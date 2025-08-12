"use client";

import { UserAndSignOutButton } from "@/app/_components/user/UserAndSignOutButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/react-auth";
import { api } from "@/trpc/react";
import { AssignmentPreview } from "./_components/AssignmentPreview";
import { ConceptsList } from "./_components/ConceptsList";
import { DailyStreak } from "./_components/DailyStreak";
import { League } from "./_components/League";

export function Home() {
  const { session } = useAuth();
  const userName = session?.user?.name ?? "User";

  const utils = api.useUtils();
  const { mutate: createInitialStudentAssignment, isPending } =
    api.assignment.createInitialStudentAssignment.useMutation({
      onSuccess: () => {
        // Refetch assignments after creating the first concept assignment
        void utils.assignment.invalidate();
        console.log("✅ Assignment created successfully!");
      },
      onError: (error) => {
        console.error("Failed to create initial assignment:", error);
      },
    });

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
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
              <DailyStreak streak={1} />
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Jump back in
              </h2>
              <League currentXP={140} targetXP={175} />
            </div>

            <div>
              <Button
                onClick={() => {
                  createInitialStudentAssignment();
                }}
                disabled={isPending}
              >
                {isPending ? "Creating..." : "Create your first lesson"}
              </Button>
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
