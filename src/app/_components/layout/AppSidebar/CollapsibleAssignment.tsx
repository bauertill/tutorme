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
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { CheckCircle, ChevronRight, Circle, MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newName, setNewName] = useState(assignment.name);
  const editAssignment = useStore.use.editAssignment();
  const deleteAssignment = useStore.use.deleteAssignment();
  useEffect(() => {
    return () => {
      setIsRenameDialogOpen(false);
    };
  }, []);

  const { mutate: renameAssignment, isPending: isRenaming } =
    api.assignment.renameAssignment.useMutation({
      onSuccess: () => {
        setIsRenameDialogOpen(false);
        editAssignment({
          ...assignment,
          name: newName,
        });
      },
    });
  const { mutate: deleteAssignmentMutation, isPending: isDeleting } =
    api.assignment.deleteAssignment.useMutation({
      onSuccess: () => {
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <MoreVertical className="h-4 w-4 cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsRenameDialogOpen(true)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment?</DialogTitle>
          </DialogHeader>
          <div className="flex flex-row justify-end gap-4 py-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteAssignmentMutation(assignment.id)}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Assignment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
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
              {isRenaming ? "Renaming..." : "Rename"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
}
