"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
        <span className="font-semibold">{assignment.name}</span>
        <div className="ml-auto flex items-center gap-2 whitespace-nowrap">
          {isSolved ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-yellow-500" />
          )}
          <span className="w-6 text-xs text-muted-foreground">
            {solvedProblemsCount} / {assignment.problems.length}
          </span>
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
              {/* @TODO replace with problem number */}
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                <Latex>{problem.problem}</Latex>
              </span>
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
