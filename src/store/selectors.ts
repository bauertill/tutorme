import { type Assignment, type UserProblem } from "@/core/assignment/types";
import { useStore } from ".";

export const useCurrentAssignment = (): Assignment | null => {
  const assignmentId = useStore.use.currentAssignmentId();
  const assignments = useStore.use.assignments();
  const assignment = assignments.find((a) => a.id === assignmentId);
  return assignment ?? assignments[0] ?? null;
};

export const useCurrentProblem = (): UserProblem | null => {
  const assignment = useCurrentAssignment();
  const problemId = useStore.use.currentProblemId();
  const problem = assignment?.problems.find((p) => p.id === problemId) ?? null;
  return problem ?? assignment?.problems[0] ?? null;
};

export const useNextProblem = () => {
  const assignment = useCurrentAssignment();
  const problemId = useStore.use.currentProblemId();
  const problemIndex = assignment?.problems.findIndex(
    (p) => p.id === problemId,
  );
  const nextProblemIndex = (problemIndex ?? 0) + 1;
  const nextProblem = assignment?.problems[nextProblemIndex];
  return nextProblem;
};

export const usePreviousProblem = () => {
  const assignment = useCurrentAssignment();
  const problemId = useStore.use.currentProblemId();
  const problemIndex = assignment?.problems.findIndex(
    (p) => p.id === problemId,
  );
  const previousProblemIndex = (problemIndex ?? 0) - 1;
  const previousProblem = assignment?.problems[previousProblemIndex];
  return previousProblem;
};

export const useGotoNextProblem = () => {
  const nextProblem = useNextProblem();
  const setCurrentProblem = useStore.use.setCurrentProblem();
  return () => {
    if (nextProblem) {
      setCurrentProblem(nextProblem);
    }
  };
};

export const useGotoPreviousProblem = () => {
  const previousProblem = usePreviousProblem();
  const setCurrentProblem = useStore.use.setCurrentProblem();
  return () => {
    if (previousProblem) {
      setCurrentProblem(previousProblem);
    }
  };
};
