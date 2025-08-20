"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSetActiveProblem } from "@/hooks/use-set-active-problem";
import { api } from "@/trpc/react";
import { Calendar, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type StudentProblem = {
  id: string;
  problem: string;
  problemNumber: string;
  referenceSolution: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type StudentSolution = {
  id: string;
  problemId: string;
  status: "INITIAL" | "IN_PROGRESS" | "SOLVED";
  createdAt: Date;
  completedAt: Date | null;
};

export function AssignmentPreview() {
  const { data: studentProblems, isLoading } =
    api.assignment.getStudentProblems.useQuery() as {
      data: StudentProblem[];
      isLoading: boolean;
    };
  const { data: studentSolutions = [] } =
    api.studentSolution.listStudentSolutions.useQuery() as {
      data: StudentSolution[];
    };
  const router = useRouter();
  const setActiveProblem = useSetActiveProblem();

  const utils = api.useUtils();
  const { mutate: createInitialStudentProblems, isPending } =
    api.assignment.createInitialStudentProblems.useMutation({
      onSuccess: async (newProblems) => {
        if (newProblems && newProblems.length > 0) {
          const firstProblemId = newProblems[0]?.id;
          if (firstProblemId) {
            void setActiveProblem(firstProblemId, "default");
          }
        }

        await utils.assignment.invalidate();
        router.push(`/assignment`);
      },
      onError: (error) => {
        console.error("Failed to create initial problems:", error);
      },
    });

  const hasAnyProblems = (studentProblems ?? []).length > 0;
  const solvedProblemIds = new Set(
    (studentSolutions ?? [])
      .filter((s) => s.completedAt && s.status === "SOLVED")
      .map((s) => s.problemId),
  );

  const unsolvedProblems = (studentProblems ?? []).filter(
    (p: StudentProblem) => !solvedProblemIds.has(p.id),
  );

  const nextProblem = unsolvedProblems[0];

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

  if (!hasAnyProblems) {
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
              You don&apos;t have any problems at the moment.
            </p>
            <Button
              onClick={() => createInitialStudentProblems()}
              disabled={isPending}
              className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
            >
              {isPending ? "Creating..." : "Create your first lesson"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estimatedTime = unsolvedProblems.length * 2; // Rough estimate: 2 minutes per problem

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
              {nextProblem ? "Continue Learning" : "Math Problems"}
            </h2>
            <div className="mb-4 flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {unsolvedProblems.length} problems
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

          {nextProblem ? (
            <Link href={`/assignment`}>
              <Button className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl">
                Continue Learning
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => createInitialStudentProblems()}
              disabled={isPending}
              className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
            >
              {isPending ? "Creating..." : "Create a new assignment"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Additional Problems List */}
      {unsolvedProblems.length > 1 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              More Problems
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unsolvedProblems.slice(1, 4).map((problem: StudentProblem) => (
              <Link key={problem.id} href={`/assignment`} className="block">
                <div className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Problem {problem.problemNumber}
                    </h3>
                    <div className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">
                      {problem.problem.substring(0, 60)}...
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

            {unsolvedProblems.length > 4 && (
              <div className="pt-2 text-center">
                <Button variant="outline" size="sm">
                  View all {unsolvedProblems.length} problems
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
