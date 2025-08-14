"use client";
import { AppSidebar } from "@/app/_components/layout/AppSidebar";
import { Latex } from "@/app/_components/richtext/Latex";
import { Progress } from "@/components/ui/progress";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tour } from "@/components/ui/tour";
import { useStore } from "@/store";
import { useActiveAssignmentId } from "@/store/problem.selectors";
import { api } from "@/trpc/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Exercise from "./_components/Exercise";
import Onboarding from "./_components/Onboarding";

export default function AssignmentPage() {
  const searchParams = useSearchParams();
  const assignmentIdFromUrl = searchParams.get("assignmentId");
  const activeAssignmentId = useActiveAssignmentId();
  const setActiveProblem = useStore.use.setActiveProblem();

  const assignmentIdToUse = assignmentIdFromUrl ?? activeAssignmentId;
  const [activeAssignment] =
    api.assignment.getStudentAssignment.useSuspenseQuery(
      assignmentIdToUse ?? "",
    );

  // Set the first problem as active when assignment loads
  useEffect(() => {
    if (activeAssignment?.problems.length && assignmentIdFromUrl) {
      const firstProblem = activeAssignment.problems[0];
      if (firstProblem) {
        setActiveProblem(firstProblem.id, assignmentIdFromUrl);
      }
    }
  }, [activeAssignment, assignmentIdFromUrl, setActiveProblem]);
  const [assignments] =
    api.assignment.listStudentAssignments.useSuspenseQuery();
  const [studentSolutions] =
    api.studentSolution.listStudentSolutions.useSuspenseQuery();

  const hasCompletedOnboarding = useStore.use.hasCompletedOnboarding();
  if (assignments.length === 0) {
    return <Onboarding />;
  }

  // Compute today's problems and solved count
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const today = new Date();
  const todayProblemIds = new Set(
    (activeAssignment?.problems ?? [])
      .filter((p) => isSameDay(new Date(p.createdAt), today))
      .map((p) => p.id),
  );
  const totalProblemsToday = todayProblemIds.size;
  const solvedProblemsCountToday = studentSolutions.filter(
    (solution) =>
      solution.status === "SOLVED" &&
      solution.studentAssignmentId === assignmentIdToUse &&
      todayProblemIds.has(solution.problemId),
  ).length;
  const progressPercentage =
    totalProblemsToday > 0
      ? (solvedProblemsCountToday / totalProblemsToday) * 100
      : 0;

  return (
    <SidebarProvider>
      {!hasCompletedOnboarding &&
        activeAssignment &&
        totalProblemsToday > 0 && <Tour />}

      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4">
          {null}
          <SidebarTrigger />
          {activeAssignment ? (
            <div className="flex w-full items-center gap-2">
              <Latex className="mr-2 flex-1 truncate font-semibold">
                {activeAssignment.name}
              </Latex>
              <div className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap">
                <span className="min-w-[44px] flex-shrink-0 text-right text-xs text-muted-foreground">
                  {solvedProblemsCountToday} / {totalProblemsToday}
                </span>
              </div>
              <Progress className="ml-2 w-24" value={progressPercentage} />
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              No assignment selected
            </span>
          )}
        </header>
        <main className="h-full">
          {/* @TODO on canvas drawing close the side bar */}
          <Exercise />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
