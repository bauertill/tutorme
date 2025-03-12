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

export const useProblemController = (): {
  activeAssignment?: Assignment;
  activeProblem?: UserProblem;
  gotoNextProblem?: () => void;
  gotoPreviousProblem?: () => void;
} => {
  const assignments = useStore.use.assignments();
  const activeAssignmentId = useStore.use.activeAssignmentId();
  const activeProblemId = useStore.use.activeProblemId();
  const setActiveProblem = useStore.use.setActiveProblem();

  const activeAssignment = assignments.find((a) => a.id === activeAssignmentId);
  const activeProblem = activeAssignment?.problems.find(
    (p) => p.id === activeProblemId,
  );
  const activeProblemIndex =
    activeAssignment?.problems.findIndex((p) => p.id === activeProblemId) ?? 0;

  const nextProblem = activeAssignment?.problems[activeProblemIndex + 1];
  const previousProblem = activeAssignment?.problems[activeProblemIndex - 1];

  const gotoNextProblem = nextProblem
    ? () => setActiveProblem(nextProblem)
    : undefined;
  const gotoPreviousProblem = previousProblem
    ? () => setActiveProblem(previousProblem)
    : undefined;

  return {
    activeAssignment,
    activeProblem,
    gotoNextProblem,
    gotoPreviousProblem,
  };
};
