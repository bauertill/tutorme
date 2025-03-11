import { type Assignment, type UserProblem } from "@/core/assignment/types";
import { useStore } from ".";

export const useActiveAssignment = (): Assignment | null => {
  const assignmentId = useStore.use.activeAssignmentId();
  const assignments = useStore.use.assignments();
  const assignment = assignments.find((a) => a.id === assignmentId);
  return assignment ?? assignments[0] ?? null;
};

export const useActiveProblem = (): UserProblem | null => {
  const assignment = useActiveAssignment();
  const problemId = useStore.use.activeProblemId();
  const problem = assignment?.problems.find((p) => p.id === problemId) ?? null;
  return problem ?? assignment?.problems[0] ?? null;
};

export const useNextProblem = () => {
  const assignment = useActiveAssignment();
  const problemId = useStore.use.activeProblemId();
  const problemIndex = assignment?.problems.findIndex(
    (p) => p.id === problemId,
  );
  const nextProblemIndex = (problemIndex ?? 0) + 1;
  const nextProblem = assignment?.problems[nextProblemIndex];
  return nextProblem;
};

export const usePreviousProblem = () => {
  const assignment = useActiveAssignment();
  const problemId = useStore.use.activeProblemId();
  const problemIndex = assignment?.problems.findIndex(
    (p) => p.id === problemId,
  );
  const previousProblemIndex = (problemIndex ?? 0) - 1;
  const previousProblem = assignment?.problems[previousProblemIndex];
  return previousProblem;
};

export const useGotoNextProblem = () => {
  const nextProblem = useNextProblem();
  const setActiveProblem = useStore.use.setActiveProblem();
  return () => {
    if (nextProblem) {
      setActiveProblem(nextProblem);
    }
  };
};

export const useGotoPreviousProblem = () => {
  const previousProblem = usePreviousProblem();
  const setActiveProblem = useStore.use.setActiveProblem();
  return () => {
    if (previousProblem) {
      setActiveProblem(previousProblem);
    }
  };
};
