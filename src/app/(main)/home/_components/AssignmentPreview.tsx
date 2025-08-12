"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Calendar, Clock, FileText } from "lucide-react";
import Link from "next/link";

export function AssignmentPreview() {
  const { data: studentAssignments, isLoading } =
    api.assignment.listStudentAssignments.useQuery();

  const utils = api.useUtils();
  const { mutate: createInitialStudentAssignment } =
    api.assignment.createInitialStudentAssignment.useMutation({
      onSuccess: () => {
        // Refetch assignments after creating the first concept assignment
        void utils.assignment.invalidate();
      },
      onError: (error) => {
        console.error("Failed to create initial assignment:", error);
      },
    });

  const nextAssignment = studentAssignments?.find(
    (assignment) => assignment.problems.length > 0,
  );

  const upcomingAssignments =
    studentAssignments?.filter(
      (assignment) => assignment.problems.length > 0,
    ) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="mx-auto h-4 w-1/4 rounded bg-gray-200"></div>
              <div className="mx-auto h-8 w-3/4 rounded bg-gray-200"></div>
              <div className="mx-auto h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="mx-auto h-32 w-32 rounded-2xl bg-gray-200"></div>
              <div className="h-12 rounded-xl bg-gray-200"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!nextAssignment) {
    return (
      <div className="space-y-6">
        <Card className="w-full">
          <CardContent className="p-6 text-center">
            <div className="mb-6">
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg">
                <div className="text-4xl text-white">📚</div>
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              No assignments yet
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              You don&apos;t have any assignments at the moment.
            </p>
            <Button
              onClick={() => createInitialStudentAssignment()}
              className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
            >
              Create your first lesson
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estimatedTime = nextAssignment.problems.length * 2; // Rough estimate: 2 minutes per problem

  return (
    <div className="space-y-6">
      {/* Next Assignment Card */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="mb-6 text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-blue-100 text-blue-800"
            >
              NEXT ASSIGNMENT
            </Badge>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {nextAssignment.name}
            </h2>
            <div className="mb-4 flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {nextAssignment.problems.length} problems
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />~{estimatedTime} min
              </div>
            </div>
          </div>

          <div className="mb-6 flex justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
              <div className="text-4xl text-white">📝</div>
            </div>
          </div>

          <Link href={`/assignment?assignmentId=${nextAssignment.id}`}>
            <Button className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl">
              Continue Assignment
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Upcoming Assignments List */}
      {upcomingAssignments.length > 1 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAssignments.slice(1, 4).map((assignment) => (
              <Link
                key={assignment.id}
                href={`/assignment?assignmentId=${assignment.id}`}
                className="block"
              >
                <div className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {assignment.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {assignment.problems.length} problems
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />~
                        {assignment.problems.length * 2} min
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}

            {upcomingAssignments.length > 4 && (
              <div className="pt-2 text-center">
                <Button variant="outline" size="sm">
                  View all {upcomingAssignments.length} assignments
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
