"use client";
import { Latex } from "@/app/_components/richtext/Latex";
import { Button } from "@/components/ui/button";
import { Trans } from "@/i18n";
import { useProblemController } from "@/store/selectors";

export default function ProblemController() {
  const {
    activeAssignment,
    activeProblem,
    gotoNextProblem,
    gotoPreviousProblem,
  } = useProblemController();

  if (!activeProblem || !activeAssignment) {
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-between border-b p-4">
      <Latex className="whitespace-pre-wrap">{activeProblem.problem}</Latex>
      <div className="flex flex-row gap-2">
        <Button
          variant="outline"
          disabled={!gotoPreviousProblem}
          onClick={() => gotoPreviousProblem && gotoPreviousProblem()}
        >
          <Trans i18nKey="back" />
        </Button>
        <Button
          variant="outline"
          disabled={!gotoNextProblem}
          onClick={() => gotoNextProblem && gotoNextProblem()}
        >
          <Trans i18nKey="next" />
        </Button>
      </div>
    </div>
  );
}
