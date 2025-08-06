"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/react-auth";
import { api } from "@/trpc/react";
import Link from "next/link";
import { DailyStreak } from "./_components/DailyStreak";
import { League } from "./_components/League";
import { LessonPreview } from "./_components/LessonPreview";

export function Home() {
  const { session } = useAuth();
  const userName = session?.user?.name ?? "User";
  const { data: studentAssignments, isLoading: isLoadingStudentAssignments } =
    api.assignment.listStudentAssignments.useQuery();

  const { mutate: createInitialStudentAssignment } =
    api.assignment.createInitialStudentAssignment.useMutation();

  const hasLessons =
    !isLoadingStudentAssignments &&
    studentAssignments &&
    studentAssignments.length > 0;

  console.log(hasLessons);

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome, {userName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to continue your learning journey?
          </p>
          <Link href="/onboarding">
            <Button>Onboarding</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column */}
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
          </div>

          {/* Right Column */}
          {hasLessons ? (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Next Lesson
              </h2>
              <LessonPreview
                title="Solving Equations"
                level={1}
                practiceTime="2 min"
                onStart={() => {
                  // This will be replaced with actual navigation later
                  console.log("Starting lesson...");
                }}
              />
            </div>
          ) : (
            <div>
              <Button
                onClick={() => {
                  createInitialStudentAssignment();
                }}
              >
                Create your first lesson
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
