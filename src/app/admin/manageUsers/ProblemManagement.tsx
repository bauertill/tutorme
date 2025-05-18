import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
import { api } from "@/trpc/react";
import React from "react";
import { UploadAdminProblems } from "./UploadAdminProblems";

export function ProblemManagement() {
  const {
    data: userProblems,
    isLoading,
    error,
    refetch,
  } = api.assignment.getUserProblems.useQuery();
  const deleteAllMutation = api.assignment.deleteAllUserProblems.useMutation({
    onSuccess: () => refetch(),
  });
  const [open, setOpen] = React.useState(false);

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
      {userProblems && userProblems.length === 0 && (
        <div>No user problems found.</div>
      )}
      <div className="grid grid-cols-1 gap-4">
        {userProblems &&
          userProblems.map((problem) => (
            <Card key={problem.id}>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold">{problem.problem}</div>
                    <div className="text-sm text-gray-500">
                      Status: {problem.status}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400 md:mt-0">
                    Created: {new Date(problem.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
