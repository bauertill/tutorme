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
import { Input } from "@/components/ui/input";
import { SidebarText } from "@/components/ui/sidebar";
import { type StudentAssignment } from "@/core/assignment/assignment.types";
import { type Problem } from "@/core/problem/problem.types";
import { Trans, useTranslation } from "@/i18n/react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { CheckCircle, ChevronRight, Circle, MoreVertical } from "lucide-react";
import { useState } from "react";
import Latex from "react-latex-next";

interface CollapsibleAssignmentProps {
  assignment: StudentAssignment;
  isOpen: boolean;
  onOpenChange: () => void;
  activeProblem: Problem | null;
  setActiveProblem: (problem: Problem) => void;
}

export function CollapsibleAssignment({
  assignment,
  isOpen,
  onOpenChange,
  activeProblem,
  setActiveProblem,
}: CollapsibleAssignmentProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(assignment.name);
  const editAssignment = useStore.use.editAssignment();
  const deleteAssignment = useStore.use.deleteAssignment();
  const studentSolutions = useStore.use.studentSolutions();

  const { mutate: renameAssignment } =
    api.assignment.renameAssignment.useMutation({
      onSuccess: () => {
        setIsEditing(false);
        editAssignment({
          ...assignment,
          name: newName,
        });
      },
      onError: (error) => {
        console.error("Failed to rename assignment:", error);
        setNewName(assignment.name);
      },
    });

  const { mutate: deleteAssignmentMutation } =
    api.assignment.deleteAssignment.useMutation({
      onSuccess: () => {
        deleteAssignment(assignment.id);
      },
    });

  const solvedProblemsCount = studentSolutions.filter(
    (solution) =>
      solution.status === "SOLVED" &&
      solution.studentAssignmentId === assignment.id,
  ).length;
  const isSolved = solvedProblemsCount === assignment.problems.length;

  const handleDelete = () => {
    if (window.confirm(t("assignment.delete.description"))) {
      deleteAssignmentMutation(assignment.id);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <div className="mb-1 flex flex-1 flex-row items-center gap-2 rounded-lg py-2 pl-2 pr-1 text-left text-sm hover:bg-accent">
        <CollapsibleTrigger
          asChild
          className="flex flex-row items-center gap-2"
        >
          <div className="flex flex-1 flex-row items-center gap-2">
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
            {isEditing ? (
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    renameAssignment({
                      assignmentId: assignment.id,
                      name: newName,
                    });
                  } else if (e.key === "Escape") {
                    setIsEditing(false);
                    setNewName(assignment.name);
                  }
                }}
                onBlur={() => {
                  setIsEditing(false);
                  setNewName(assignment.name);
                }}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                inputMode="text"
              />
            ) : (
              <SidebarText className="flex-1 truncate font-semibold">
                {assignment.name}
              </SidebarText>
            )}
            <SidebarText className="min-w-[44px] flex-shrink-0 text-right text-xs text-muted-foreground">
              {solvedProblemsCount} / {assignment.problems.length}
            </SidebarText>
          </div>
        </CollapsibleTrigger>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <MoreVertical className="h-4 w-4 cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setIsEditing(true);
                setNewName(assignment.name);
              }}
              className="cursor-pointer hover:bg-accent"
            >
              <Trans i18nKey="assignment.rename.button" />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-destructive hover:bg-accent"
              onClick={handleDelete}
            >
              <Trans i18nKey="assignment.delete.button" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
            </button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
