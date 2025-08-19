import { Latex } from "@/app/_components/richtext/Latex";
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
import { type EvaluationResult } from "@/core/studentSolution/studentSolution.types";
import { useSetActiveProblem } from "@/hooks/use-set-active-problem";
import { useTranslation } from "@/i18n/react";
import {
  useActiveAssignmentId,
  useProblemController,
} from "@/store/problem.selectors";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function CelebrationDialog({
  evaluationResult,
  open,
  setOpen,
}: {
  evaluationResult: EvaluationResult | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const { gotoNextUnsolvedProblem } = useProblemController();
  const activeAssignmentId = useActiveAssignmentId();
  const [dailyProgress] = api.assignment.getDailyProgress.useSuspenseQuery(
    activeAssignmentId ?? "",
  );
  const todayRemaining = dailyProgress?.remaining ?? 0;

  const utils = api.useUtils();
  const setActiveProblem = useSetActiveProblem();
  const router = useRouter();
  const { mutateAsync: createInitialAssignmentAsync, isPending } =
    api.assignment.createInitialStudentAssignment.useMutation({
      onSuccess: async () => {
        await Promise.all([
          utils.assignment.listStudentAssignments.invalidate(),
        ]);
      },
    });
  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      {open && <Confetti />}
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t("celebrationDialog.title")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {evaluationResult?.successMessage && (
            <Latex>{evaluationResult.successMessage}</Latex>
          )}
          {todayRemaining > 0 ? (
            <p>
              Keep going {todayRemaining} more problem
              {todayRemaining === 1 ? "" : "s"} to complete today.
            </p>
          ) : (
            <p>You&apos;ve completed your daily training.</p>
          )}
        </div>
        <DialogFooter className="justify-end gap-2">
          {todayRemaining > 0 && gotoNextUnsolvedProblem ? (
            <DialogClose asChild>
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  gotoNextUnsolvedProblem?.();
                  setOpen(false);
                }}
              >
                {t("celebrationDialog.next_problem")}
              </Button>
            </DialogClose>
          ) : (
            <DialogClose asChild>
              <div className="flex w-full items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="default"
                  disabled={isPending}
                  onClick={async () => {
                    const newAssignment = await createInitialAssignmentAsync();

                    if (!newAssignment) return;

                    router.push(`/assignment?assignmentId=${newAssignment.id}`);
                    const firstProblemId = newAssignment.problems?.[0]?.id;

                    if (firstProblemId) {
                      void setActiveProblem(firstProblemId, newAssignment.id);
                    }

                    setOpen(false);
                  }}
                >
                  Earn more points
                </Button>
                <Button type="button" variant="outline">
                  <Link href="/home">Return home</Link>
                </Button>
              </div>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
