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
import { useActiveAssignment } from "@/store/selectors";
import Exercise from "./_components/Exercise";
import Onboarding from "./_components/Onboarding";
export default function AssignmentPage() {
  const activeAssignment = useActiveAssignment();
  const assignments = useStore.use.assignments();

  const hasCompletedOnboarding = useStore.use.hasCompletedOnboarding();
  if (assignments.length === 0) {
    return <Onboarding />;
  }

  const solvedProblemsCount =
    activeAssignment?.problems.filter((problem) => problem.status === "SOLVED")
      .length ?? 0;
  const totalProblems = activeAssignment?.problems.length ?? 0;
  const progressPercentage =
    totalProblems > 0 ? (solvedProblemsCount / totalProblems) * 100 : 0;

  return (
    <SidebarProvider>
      {!hasCompletedOnboarding && <Tour />}

      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4">
          <SidebarTrigger />
          {activeAssignment ? (
            <div className="flex w-full items-center gap-2">
              <Latex className="mr-2 flex-1 truncate font-semibold">
                {activeAssignment.name}
              </Latex>
              <div className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap">
                <span className="min-w-[44px] flex-shrink-0 text-right text-xs text-muted-foreground">
                  {solvedProblemsCount} / {totalProblems}
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
