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
import { AdminProblemModal } from "./AdminProblemModal";
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
  const approveMutation = api.assignment.approveUserProblems.useMutation({
    onSuccess: () => refetch(),
  });
  const [open, setOpen] = React.useState(false);
  const [selectedProblems, setSelectedProblems] = React.useState<Set<string>>(
    new Set(),
  );
  const [selectedProblemModalIndex, setSelectedProblemModalIndex] =
    React.useState<number | null>(null);
  const approveSingleMutation = api.assignment.approveUserProblems.useMutation({
    onSuccess: () => refetch(),
  });
  const [createAssignmentOpen, setCreateAssignmentOpen] = React.useState(false);
  const [assignmentName, setAssignmentName] = React.useState(() => {
    const today = new Date();
    return `Homework - ${today.toLocaleDateString("en-GB")}`;
  });
  const createAssignmentMutation =
    api.assignment.createAssignmentFromProblems.useMutation({
      onSuccess: () => {
        setCreateAssignmentOpen(false);
        setSelectedProblems(new Set());
        refetchAssignments();
      },
    });
  const { data: assignments = [], refetch: refetchAssignments } =
    api.assignment.list.useQuery();
  const filteredAssignments = assignments.filter(
    (a: any) => !a.name.startsWith("Upload @"),
  );

  const allSelected =
    userProblems.length > 0 && selectedProblems.size === userProblems.length;
  const someSelected =
    selectedProblems.size > 0 && selectedProblems.size < userProblems.length;

  const selectedNewProblems = userProblems.filter(
    (p) => selectedProblems.has(p.id) && p.status === "NEW",
  );
  const canApprove = selectedNewProblems.length > 0;

  // Find all problems in modal mode (all problems, or just NEW ones?)
  const modalProblems = userProblems;
  const allApproved = modalProblems.every((p) => p.status !== "NEW");

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

  const handleOpenModal = (problem: any) => {
    const idx = modalProblems.findIndex((p) => p.id === problem.id);
    setSelectedProblemModalIndex(idx !== -1 ? idx : null);
  };

  const handleApproveModal = async (problemId: string) => {
    await approveSingleMutation.mutateAsync([problemId]);
    // Find next NEW problem
    const nextIdx = modalProblems.findIndex(
      (p, i) => i > (selectedProblemModalIndex ?? 0) && p.status === "NEW",
    );
    if (nextIdx !== -1) {
      setSelectedProblemModalIndex(nextIdx);
    } else {
      setSelectedProblemModalIndex(null);
    }
  };

  const handleDoneModal = () => {
    setSelectedProblemModalIndex(null);
  };

  // Placeholder for adding assignment to user group
  const addAssignmentToUserGroup = (assignmentId: string) => {
    console.log("Add to User Group:", assignmentId);
  };

  const [addToGroupAssignmentId, setAddToGroupAssignmentId] = React.useState<
    string | null
  >(null);
  const { data: userGroups = [], isLoading: groupsLoading } =
    api.admin.getGroups.useQuery();

  const handleAddToUserGroup = (assignmentId: string) => {
    setAddToGroupAssignmentId(assignmentId);
  };
  const handleSelectGroup = (groupId: string) => {
    if (addToGroupAssignmentId) {
      console.log(
        "Add assignment",
        addToGroupAssignmentId,
        "to group",
        groupId,
      );
      setAddToGroupAssignmentId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex w-full flex-row items-start justify-between">
        <CardTitle>Problem Management</CardTitle>
        <div className="flex gap-2">
          <UploadAdminProblems onSuccess={refetch} />
          <Button
            onClick={() =>
              approveMutation.mutate(selectedNewProblems.map((p) => p.id))
            }
            disabled={!canApprove || approveMutation.isPending}
            variant="default"
          >
            {approveMutation.isPending ? "Approving..." : "Approve"}
          </Button>
          <Button
            onClick={() => setCreateAssignmentOpen(true)}
            disabled={selectedProblems.size === 0}
            variant="secondary"
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
                className="cursor-pointer"
                onClick={(e) => {
                  if (
                    (e.target as HTMLElement).closest(
                      'button,input[type="checkbox"]',
                    )
                  )
                    return;
                  handleOpenModal(problem);
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
                <TableCell>{problem.status}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {new Date(problem.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <AdminProblemModal
        open={selectedProblemModalIndex !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedProblemModalIndex(null);
        }}
        problems={modalProblems}
        activeIndex={selectedProblemModalIndex ?? 0}
        onApprove={handleApproveModal}
        onDone={handleDoneModal}
        isApproving={approveSingleMutation.isPending}
      />
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
          </div>
          <ModalFooter>
            <Button
              onClick={() =>
                createAssignmentMutation.mutate({
                  name: assignmentName,
                  problemIds: Array.from(selectedProblems),
                })
              }
              disabled={
                assignmentName.trim() === "" ||
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
              {filteredAssignments.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell>{a.name}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{a.problems?.length ?? 0}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddToUserGroup(a.id)}
                    >
                      Add to User Group
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {/* Add to User Group Modal */}
      <Modal
        open={!!addToGroupAssignmentId}
        onOpenChange={(open) => !open && setAddToGroupAssignmentId(null)}
      >
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Select a User Group</ModalTitle>
          </ModalHeader>
          <div className="space-y-2 py-2">
            {groupsLoading && <div>Loading groups...</div>}
            {!groupsLoading && userGroups.length === 0 && (
              <div>No groups found.</div>
            )}
            {!groupsLoading &&
              userGroups.map((group: any) => (
                <button
                  key={group.id}
                  className="w-full rounded border p-2 text-left hover:bg-muted focus:outline-none"
                  onClick={() => handleSelectGroup(group.id)}
                >
                  <div className="font-medium">{group.name}</div>
                  {group.description && (
                    <div className="text-sm text-muted-foreground">
                      {group.description}
                    </div>
                  )}
                </button>
              ))}
          </div>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setAddToGroupAssignmentId(null)}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
