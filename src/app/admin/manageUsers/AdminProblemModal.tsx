import { Latex } from "@/app/_components/richtext/Latex";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type UserProblem } from "@/core/assignment/types";
import Image from "next/image";

export function AdminProblemModal({
  open,
  onOpenChange,
  problems,
  activeIndex,
  onApprove,
  onDone,
  isApproving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problems: UserProblem[];
  activeIndex: number;
  onApprove: (problemId: string) => void;
  onDone: () => void;
  isApproving: boolean;
}) {
  const problem = problems[activeIndex];
  if (!problem) return null;
  const allApproved = problems.every((p) => p.status !== "NEW");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="mr-4 flex flex-row items-center justify-between">
            <div className="text-s text-muted-foreground">
              {problem.problemNumber}
            </div>
            <div className="text-sm text-muted-foreground">
              {problem.status === "NEW" ? "NEW" : "APPROVED"}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div className="rounded">
            <Latex>{problem.problem}</Latex>
          </div>
          {problem.imageUrl && (
            <div className="mt-2">
              <Image
                src={problem.imageUrl}
                alt="Uploaded problem"
                className="max-h-64 rounded border"
              />
            </div>
          )}
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          {!allApproved && problem.status === "NEW" && (
            <Button
              variant="default"
              onClick={() => onApprove(problem.id)}
              disabled={isApproving}
            >
              {isApproving ? "Approving..." : "Approve"}
            </Button>
          )}
          {allApproved && (
            <Button variant="default" onClick={onDone}>
              DONE
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
