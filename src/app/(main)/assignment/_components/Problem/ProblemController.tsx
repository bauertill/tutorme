"use client";
import { ProblemStatusIcon } from "@/app/_components/layout/ProblemStatusIcon";
import { Button } from "@/components/ui/button";
import { Trans } from "@/i18n";
import { useProblemController } from "@/store/selectors";
import { ProblemRenderer } from "./ProblemRenderer";

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
    <div className="flex flex-col border-b">
      <div className="w-full p-4">
        <ProblemRenderer problem={activeProblem} />
      </div>
      <div className="flex flex-row items-center justify-end gap-2 p-2">
        <ProblemStatusIcon status={activeProblem.status} />
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
