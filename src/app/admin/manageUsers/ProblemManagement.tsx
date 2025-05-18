import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle as DialogTitleUI,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import React from "react";
import { UploadAdminProblems } from "./UploadAdminProblems";

export function ProblemManagement() {
  const {
    data: userProblems = [],
    isLoading,
    error,
    refetch,
  } = api.assignment.getUserProblems.useQuery();
  const deleteAllMutation = api.assignment.deleteAllUserProblems.useMutation({
    onSuccess: () => refetch(),
  });
  const [open, setOpen] = React.useState(false);
  const [selectedProblems, setSelectedProblems] = React.useState<Set<string>>(
    new Set(),
  );

  const allSelected =
    userProblems.length > 0 && selectedProblems.size === userProblems.length;
  const someSelected =
    selectedProblems.size > 0 && selectedProblems.size < userProblems.length;

  const handleSelectAll = () => {
    if (selectedProblems.size === userProblems.length) {
      setSelectedProblems(new Set());
    } else {
      setSelectedProblems(new Set(userProblems.map((p) => p.id)));
    }
  };

  const handleProblemSelect = (problemId: string) => {
    const newSelected = new Set(selectedProblems);
    if (newSelected.has(problemId)) {
      newSelected.delete(problemId);
    } else {
      newSelected.add(problemId);
    }
    setSelectedProblems(newSelected);
  };

  const selectAllCheckboxRef = React.useCallback(
    (el: HTMLButtonElement | null) => {
      if (el) {
        const input = el.querySelector(
          'input[type="checkbox"]',
        ) as HTMLInputElement | null;
        if (input) input.indeterminate = someSelected;
      }
    },
    [someSelected],
  );

  return (
    <div className="space-y-4">
      <div className="flex w-full flex-row items-start justify-between">
        <CardTitle>Problem Management</CardTitle>
        <div className="flex gap-2">
          <UploadAdminProblems onSuccess={refetch} />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={deleteAllMutation.isPending}
              >
                {deleteAllMutation.isPending
                  ? "Deleting..."
                  : "Delete All Problems"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitleUI>Are you sure?</DialogTitleUI>
                <DialogDescription>
                  This will permanently delete all user problems for your
                  account. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteAllMutation.mutate();
                    setOpen(false);
                  }}
                  disabled={deleteAllMutation.isPending}
                >
                  Yes, delete all
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {isLoading && <div>Loading user problems...</div>}
      {error && <div className="text-red-500">Error loading user problems</div>}
      {userProblems.length === 0 && !isLoading && (
        <div>No user problems found.</div>
      )}
      {userProblems.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all problems"
                  ref={selectAllCheckboxRef}
                />
              </TableHead>
              <TableHead>Problem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userProblems.map((problem) => (
              <TableRow
                key={problem.id}
                data-state={
                  selectedProblems.has(problem.id) ? "selected" : undefined
                }
              >
                <TableCell>
                  <Checkbox
                    checked={selectedProblems.has(problem.id)}
                    onCheckedChange={() => handleProblemSelect(problem.id)}
                    aria-label={`Select problem ${problem.id}`}
                  />
                </TableCell>
                <TableCell
                  className="max-w-xs truncate"
                  title={problem.problem}
                >
                  {problem.problem}
                </TableCell>
                <TableCell>{problem.status}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {new Date(problem.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
