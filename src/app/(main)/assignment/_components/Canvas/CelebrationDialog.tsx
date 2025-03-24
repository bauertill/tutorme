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
import { useTranslation } from "@/i18n";

export function CelebrationDialog({
  open,
  setOpen,
  onNextProblem,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onNextProblem: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      {open && <Confetti />}
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t("celebrationDialog.title")}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <p>{t("celebrationDialog.description")}</p>
        </div>
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button
              type="button"
              variant="default"
              onClick={() => {
                onNextProblem();
                setOpen(false);
              }}
            >
              {t("celebrationDialog.nextProblem")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
