"use client";
import { ProblemStatusIcon } from "@/app/_components/layout/ProblemStatusIcon";
import { Button } from "@/components/ui/button";
import { Trans } from "@/i18n/react";
import { useProblemController } from "@/store/selectors";
import { ProblemRenderer } from "./ProblemRenderer";

export default function ProblemController() {
  const {
    activeAssignment,
    activeProblem,
    nextProblem,
    previousProblem,
    gotoNextProblem,
    gotoPreviousProblem,
  } = useProblemController();

  if (!activeProblem || !activeAssignment) {
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-between border-b p-4">
      <div className="flex flex-row items-center gap-1">
        <ProblemRenderer problem={activeProblem} />
      </div>
      <div className="flex flex-row items-center gap-2">
        <ProblemStatusIcon status={activeProblem.status} />
        <Button
          variant="outline"
          disabled={!previousProblem}
          onClick={() => previousProblem && gotoPreviousProblem()}
        >
          <Trans i18nKey="back" />
        </Button>
        <Button
          variant="outline"
          disabled={!nextProblem}
          onClick={() => nextProblem && gotoNextProblem()}
        >
          <Trans i18nKey="next" />
        </Button>
      </div>
    </div>
  );
}
