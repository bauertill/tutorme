import { Button } from "@/components/ui/button";
import Confetti from "@/components/ui/confetti";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CelebrationDialog({
  open,
  setOpen,
  onNextProblem,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onNextProblem: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {open && <Confetti />}
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Congratulations!</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <p>
            Congratulations! You solved the problem. You can now move on to the
            next problem.
          </p>
        </div>
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button
              type="button"
              variant="default"
              onClick={(e) => {
                e.preventDefault();
                onNextProblem();
                setOpen(false);
              }}
            >
              Next problem
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
