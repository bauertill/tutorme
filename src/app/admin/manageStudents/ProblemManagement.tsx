import { Latex } from "@/app/_components/richtext/Latex";
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
  Dialog as Modal,
  DialogContent as ModalContent,
  DialogFooter as ModalFooter,
  DialogHeader as ModalHeader,
  DialogTitle as ModalTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { MoreVertical } from "lucide-react";
import React from "react";
import { UploadAdminProblems } from "./UploadAdminProblems";

export function ProblemManagement() {
  const {
    data: userProblems = [],
    isLoading,
    error,
    refetch,
  } = api.problem.getProblems.useQuery();
  const deleteAllMutation =
    api.assignment.deleteAllAssignmentsAndProblems.useMutation({
      onSuccess: async () => {
        await refetch();
        await refetchAssignments();
      },
    });
  const [open, setOpen] = React.useState(false);
  const [selectedProblems, setSelectedProblems] = React.useState<Set<string>>(
    new Set(),
  );
  const [createAssignmentOpen, setCreateAssignmentOpen] = React.useState(false);
  const [assignmentName, setAssignmentName] = React.useState(() => {
    const today = new Date();
    return `Homework - ${today.toLocaleDateString("en-GB")}`;
  });
  const createAssignmentMutation =
    api.assignment.createAssignmentFromProblems.useMutation({
      onSuccess: async () => {
        setCreateAssignmentOpen(false);
        setSelectedProblems(new Set());
        await refetchAssignments();
      },
    });
  const { data: assignments = [], refetch: refetchAssignments } =
    api.assignment.listGroupAssignments.useQuery();
  const filteredAssignments = assignments.filter(
    (a) => !a.name.startsWith("Upload @"),
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
      if (!el) return;
      const input: HTMLInputElement | null = el.querySelector(
        'input[type="checkbox"]',
      );
      if (input) input.indeterminate = someSelected;
    },
    [someSelected],
  );

  const { data: userGroups = [], isLoading: groupsLoading } =
    api.admin.getGroups.useQuery();
  const [selectedStudentGroupId, setSelectedStudentGroupId] =
    React.useState<string>();

  return (
    <div className="space-y-4">
      <div className="flex w-full flex-row items-start justify-between">
        <CardTitle>Problem Management</CardTitle>
        <div className="flex gap-2">
          <UploadAdminProblems onSuccess={refetch} />
          <Button
            onClick={() => setCreateAssignmentOpen(true)}
            disabled={selectedProblems.size === 0}
          >
            Create Assignment
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                Delete All Problems
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={open} onOpenChange={setOpen}>
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
              <TableHead>#</TableHead>
              <TableHead>Problem</TableHead>
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
                className="cursor-pointer"
                onClick={(e) => {
                  if (
                    (e.target as HTMLElement).closest(
                      'button,input[type="checkbox"]',
                    )
                  )
                    return;
                }}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedProblems.has(problem.id)}
                    onCheckedChange={() => handleProblemSelect(problem.id)}
                    aria-label={`Select problem ${problem.id}`}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {problem.problemNumber}
                </TableCell>
                <TableCell
                  className="max-w-xs truncate"
                  title={problem.problem}
                >
                  <Latex>{problem.problem}</Latex>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {new Date(problem.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Modal open={createAssignmentOpen} onOpenChange={setCreateAssignmentOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Create Assignment</ModalTitle>
          </ModalHeader>
          <div className="space-y-2 py-2">
            <label className="block text-sm font-medium">Assignment Name</label>
            <input
              className="w-full rounded border px-2 py-1"
              value={assignmentName}
              onChange={(e) => setAssignmentName(e.target.value)}
            />
            <label className="block text-sm font-medium">
              Select a User Group
            </label>
            <Select
              value={selectedStudentGroupId}
              onValueChange={(value) => setSelectedStudentGroupId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user group" />
              </SelectTrigger>
              <SelectContent>
                {groupsLoading ? (
                  <SelectItem value="">Loading...</SelectItem>
                ) : (
                  userGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <ModalFooter>
            <Button
              onClick={() =>
                selectedStudentGroupId &&
                createAssignmentMutation.mutate({
                  name: assignmentName,
                  problemIds: Array.from(selectedProblems),
                  studentGroupId: selectedStudentGroupId,
                })
              }
              disabled={
                assignmentName.trim() === "" ||
                !!assignments.find((a) => a.name === assignmentName) ||
                !selectedStudentGroupId ||
                createAssignmentMutation.isPending
              }
            >
              {createAssignmentMutation.isPending ? "Creating..." : "Create"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setCreateAssignmentOpen(false)}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {filteredAssignments.length > 0 && (
        <div>
          <div className="mb-2 text-lg font-semibold">Assignments</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead># Problems</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.name}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{a.problems?.length ?? 0}</TableCell>
                  <TableCell>{a.studentGroup.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
