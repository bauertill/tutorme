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
import { useSetActiveProblem } from "@/hooks/use-set-active-problem";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type StudentProblem = {
  id: string;
  problem: string;
  problemNumber: string;
  referenceSolution: string | null;
  createdAt: Date;
  updatedAt: Date;
};

import Exercise from "./_components/Exercise";
import Onboarding from "./_components/Onboarding";

export default function AssignmentPage() {
  const setActiveProblemSafe = useSetActiveProblem();
  const activeProblemId = useStore.use.activeProblemId();
  const router = useRouter();

  const [studentProblems] =
    api.assignment.getStudentProblems.useSuspenseQuery();
  const [studentSolutions] =
    api.studentSolution.listStudentSolutions.useSuspenseQuery();

  useEffect(() => {
    if (studentProblems.length > 0) {
      if (activeProblemId) {
        const activeProblemExists = (studentProblems as StudentProblem[]).find(
          (p: StudentProblem) => p.id === activeProblemId,
        );

        if (activeProblemExists) {
          return;
        }
      }

      const newestProblem = (studentProblems as StudentProblem[])[0];
      const solvedProblemIds = new Set(
        studentSolutions
          .filter((s) => s.status === "SOLVED")
          .map((s) => s.problemId),
      );

      const newestIsUnsolved =
        newestProblem && !solvedProblemIds.has(newestProblem.id);

      if (newestIsUnsolved) {
        void setActiveProblemSafe(newestProblem.id, "default");
      } else {
        const firstUnsolvedProblem = (studentProblems as StudentProblem[]).find(
          (p: StudentProblem) => !solvedProblemIds.has(p.id),
        );

        if (firstUnsolvedProblem) {
          void setActiveProblemSafe(firstUnsolvedProblem.id, "default");
        } else {
          router.push("/home");
        }
      }
    }
  }, [
    studentProblems,
    studentSolutions,
    activeProblemId,
    setActiveProblemSafe,
    router,
  ]);

  const hasCompletedOnboarding = useStore.use.hasCompletedOnboarding();
  if (studentProblems.length === 0) {
    return <Onboarding />;
  }

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const today = new Date();
  const todayProblemIds = new Set(
    (studentProblems as StudentProblem[])
      .filter((p: StudentProblem) => isSameDay(new Date(p.createdAt), today))
      .map((p: StudentProblem) => p.id),
  );
  const totalProblemsToday = todayProblemIds.size;
  const solvedProblemsCountToday = studentSolutions.filter(
    (solution) =>
      solution.status === "SOLVED" && todayProblemIds.has(solution.problemId),
  ).length;

  const totalProblemsAll = studentProblems.length;
  const solvedProblemsCountAll = studentSolutions.filter(
    (solution) => solution.status === "SOLVED",
  ).length;

  const useToday = totalProblemsToday > 0;
  const displayedSolved = useToday
    ? solvedProblemsCountToday
    : solvedProblemsCountAll;
  const displayedTotal = useToday ? totalProblemsToday : totalProblemsAll;
  const progressPercentage =
    displayedTotal > 0 ? (displayedSolved / displayedTotal) * 100 : 0;

  return (
    <SidebarProvider>
      {!hasCompletedOnboarding && totalProblemsToday > 0 && <Tour />}

      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4">
          {null}
          <SidebarTrigger />
          {studentProblems.length > 0 ? (
            <div className="flex w-full items-center gap-2">
              <Latex className="mr-2 flex-1 truncate font-semibold">
                Math Problems
              </Latex>
              <div className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap">
                <span className="min-w-[44px] flex-shrink-0 text-right text-xs text-muted-foreground">
                  {displayedSolved} / {displayedTotal}
                </span>
              </div>
              <Progress className="ml-2 w-24" value={progressPercentage} />
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              No problems available
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
