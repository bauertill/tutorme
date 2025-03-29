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
import { useTranslation } from "@/i18n/react";
import { useProblemController } from "@/store/selectors";

export function CelebrationDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const { gotoNextUnsolvedProblem } = useProblemController();
  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      {open && <Confetti />}
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t("celebrationDialog.title")}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <p>
            {gotoNextUnsolvedProblem
              ? t("celebrationDialog.description_one_problem_solved")
              : t("celebrationDialog.description_all_problems_solved")}
          </p>
        </div>
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button
              type="button"
              variant="default"
              onClick={() => {
                gotoNextUnsolvedProblem?.();
                setOpen(false);
              }}
            >
              {gotoNextUnsolvedProblem
                ? t("celebrationDialog.next_problem")
                : t("celebrationDialog.close")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
