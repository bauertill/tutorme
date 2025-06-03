"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarText } from "@/components/ui/sidebar";
import { type Assignment, type UserProblem } from "@/core/assignment/types";
import { Trans, useTranslation } from "@/i18n/react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { CheckCircle, ChevronRight, Circle, MoreVertical } from "lucide-react";
import { useState } from "react";
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
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"rename" | "delete">("rename");
  const [newName, setNewName] = useState(assignment.name);
  const editAssignment = useStore.use.editAssignment();
  const deleteAssignment = useStore.use.deleteAssignment();

  const { mutate: renameAssignment, isPending: isRenaming } =
    api.assignment.renameAssignment.useMutation({
      onSuccess: () => {
        setIsDialogOpen(false);
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

  const { mutate: deleteAssignmentMutation, isPending: isDeleting } =
    api.assignment.deleteAssignment.useMutation({
      onSuccess: () => {
        setIsDialogOpen(false);
        deleteAssignment(assignment.id);
      },
    });

  const solvedProblemsCount = assignment.problems.filter(
    (problem) => problem.status === "SOLVED",
  ).length;
  const isSolved = solvedProblemsCount === assignment.problems.length;

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
            <SidebarText className="flex-1 truncate font-semibold">
              {assignment.name}
            </SidebarText>
            <SidebarText className="min-w-[44px] flex-shrink-0 text-right text-xs text-muted-foreground">
              {solvedProblemsCount} / {assignment.problems.length}
            </SidebarText>
          </div>
        </CollapsibleTrigger>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MoreVertical className="h-4 w-4 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setDialogType("rename");
                  setIsDialogOpen(true);
                }}
                className="cursor-pointer hover:bg-accent"
              >
                <Trans i18nKey="assignment.rename.button" />
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive hover:bg-accent"
                onClick={() => {
                  setDialogType("delete");
                  setIsDialogOpen(true);
                }}
              >
                <Trans i18nKey="assignment.delete.button" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {dialogType === "rename" ? (
            <DialogContent className="rounded-lg">
              <DialogHeader>
                <DialogTitle>
                  <Trans i18nKey="assignment.rename.title" />
                </DialogTitle>
                <DialogDescription>
                  <Trans i18nKey="assignment.rename.description" />
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t("assignment.rename.placeholder")}
                  disabled={isRenaming}
                />
                <Button
                  onClick={() =>
                    renameAssignment({
                      assignmentId: assignment.id,
                      name: newName,
                    })
                  }
                  disabled={isRenaming || newName === assignment.name}
                >
                  {isRenaming ? (
                    <Trans i18nKey="assignment.rename.button_loading" />
                  ) : (
                    <Trans i18nKey="assignment.rename.button" />
                  )}
                </Button>
              </div>
            </DialogContent>
          ) : (
            <DialogContent className="rounded-lg">
              <DialogHeader>
                <DialogTitle>
                  <Trans i18nKey="assignment.delete.title" />
                </DialogTitle>
                <DialogDescription>
                  <Trans i18nKey="assignment.delete.description" />
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-row justify-end gap-4 py-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isDeleting}
                >
                  <Trans i18nKey="assignment.delete.cancel" />
                </Button>
                <Button
                  onClick={() => deleteAssignmentMutation(assignment.id)}
                  disabled={isDeleting}
                  variant="destructive"
                >
                  {isDeleting ? (
                    <Trans i18nKey="assignment.delete.button_loading" />
                  ) : (
                    <Trans i18nKey="assignment.delete.button" />
                  )}
                </Button>
              </div>
            </DialogContent>
          )}
        </Dialog>
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
