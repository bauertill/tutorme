import { Latex } from "@/app/_components/richtext/Latex";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  problems: any[];
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
          <DialogTitle>Problem Details</DialogTitle>
          <DialogDescription>
            Review the original problem and image before approving.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <span className="font-semibold">Problem Number:</span>{" "}
            {problem.problemNumber}
          </div>
          <div>
            <span className="font-semibold">Status:</span> {problem.status}
          </div>
          <div>
            <span className="font-semibold">Problem:</span>
            <div className="mt-1 rounded bg-muted p-2">
              <Latex>{problem.problem}</Latex>
            </div>
          </div>
          {problem.imageUrl && (
            <div>
              <span className="font-semibold">Original Image:</span>
              <div className="mt-2">
                <img
                  src={problem.imageUrl}
                  alt="Uploaded problem"
                  className="max-h-64 rounded border"
                  style={{ maxWidth: "100%" }}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
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
