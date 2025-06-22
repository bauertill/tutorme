"use client";
import { Button } from "@/components/ui/button";
import { Trans } from "@/i18n/react";
import { useStore } from "@/store";
import {
  useActiveProblem,
  useActiveStudentSolution,
  useProblemController,
} from "@/store/problem.selectors";
import { ProblemRenderer } from "./ProblemRenderer";
import { ProblemStatusIcon } from "./ProblemStatusIcon";

export default function ProblemController() {
  const { nextProblem, previousProblem, gotoNextProblem, gotoPreviousProblem } =
    useProblemController();

  const activeProblem = useActiveProblem();
  const activeStudentSolution = useActiveStudentSolution();
  const activeAssignmentId = useStore.use.activeAssignmentId();

  const isTourRunning = useStore.use.isTourRunning();
  if (!activeProblem || !activeAssignmentId) {
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-between border-b p-4">
      <div className="flex flex-row items-center gap-1">
        <ProblemRenderer problem={activeProblem} />
      </div>

      <div className="flex flex-row items-center gap-2">
        <ProblemStatusIcon
          status={activeStudentSolution?.status ?? "INITIAL"}
        />
        <Button
          variant="outline"
          disabled={!previousProblem || isTourRunning}
          onClick={() => previousProblem && gotoPreviousProblem()}
        >
          <Trans i18nKey="back" />
        </Button>
        <Button
          variant="outline"
          disabled={!nextProblem || isTourRunning}
          onClick={() => nextProblem && gotoNextProblem()}
        >
          <Trans i18nKey="next" />
        </Button>
      </div>
    </div>
  );
}
