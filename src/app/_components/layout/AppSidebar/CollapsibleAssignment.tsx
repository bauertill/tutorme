"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarText } from "@/components/ui/sidebar";
import { type Assignment, type UserProblem } from "@/core/assignment/types";
import { cn } from "@/lib/utils";
import { CheckCircle, ChevronRight, Circle } from "lucide-react";
import Latex from "react-latex-next";

interface CollapsibleAssignmentProps {
  assignment: Assignment;
  isOpen: boolean;
  onOpenChange: () => void;
  activeProblem: UserProblem | null;
  setActiveProblem: (problem: UserProblem) => void;
}

export function CollapsibleAssignment({
  assignment,
  isOpen,
  onOpenChange,
  activeProblem,
  setActiveProblem,
}: CollapsibleAssignmentProps) {
  const solvedProblemsCount = assignment.problems.filter(
    (problem) => problem.status === "SOLVED",
  ).length;
  const isSolved = solvedProblemsCount === assignment.problems.length;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent">
        <ChevronRight
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
        <SidebarText className="mr-2 flex-1 truncate font-semibold">
          {assignment.name}
        </SidebarText>
        <div className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap">
          {isSolved ? (
            <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
          )}
          <SidebarText className="min-w-[44px] flex-shrink-0 text-right text-xs text-muted-foreground">
            {solvedProblemsCount} / {assignment.problems.length}
          </SidebarText>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1 pl-6">
          {assignment.problems.map((problem) => (
            <button
              key={problem.id}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent",
                activeProblem?.id === problem.id && "bg-accent",
              )}
              onClick={() => setActiveProblem(problem)}
            >
              <SidebarText className="overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="mr-1 text-muted-foreground">
                  {problem.problemNumber}
                </span>
                <Latex>{problem.problem}</Latex>
              </SidebarText>
              {problem.status === "SOLVED" && (
                <CheckCircle className="ml-auto flex h-4 min-h-4 w-4 min-w-4 text-green-500" />
              )}
              {problem.status === "IN_PROGRESS" && (
                <Circle className="ml-auto flex h-4 w-4 min-w-4 text-yellow-500" />
              )}
              {problem.status === "FAILED" && (
                <Circle className="ml-auto flex h-4 w-4 min-w-4 text-red-500" />
              )}
            </button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
