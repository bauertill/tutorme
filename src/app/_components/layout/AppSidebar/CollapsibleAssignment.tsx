"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarText } from "@/components/ui/sidebar";
import { type Assignment, type UserProblem } from "@/core/assignment/types";
import { cn } from "@/lib/utils";
import { CheckCircle, ChevronRight, Circle, MoreVertical } from "lucide-react";
import Latex from "react-latex-next";
import { ProblemStatusIcon } from "../ProblemStatusIcon";

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
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg py-1 pl-2 text-left text-sm hover:bg-accent">
        <ChevronRight
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
        {isSolved ? (
          <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
        ) : (
          <Circle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
        )}
        <SidebarText className="flex-1 truncate font-semibold">
          {assignment.name}
        </SidebarText>
        <div className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap">
          <SidebarText className="min-w-[44px] flex-shrink-0 text-right text-xs text-muted-foreground">
            {solvedProblemsCount} / {assignment.problems.length}
          </SidebarText>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              <ProblemStatusIcon status={problem.status} />
            </button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
