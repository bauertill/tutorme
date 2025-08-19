import { type Problem } from "@/core/problem/problem.types";
import { type StudentSolution } from "@/core/studentSolution/studentSolution.types";
import { useSetActiveProblem } from "@/hooks/use-set-active-problem";
import { api } from "@/trpc/react";
import { useCallback } from "react";
import { useShallow } from "zustand/shallow";
import { useStore } from ".";

export const useActiveAssignmentId = (): string | null => {
  return useStore(useShallow(({ activeAssignmentId }) => activeAssignmentId));
};

export const useActiveProblem = (): Problem | null => {
  const activeAssignmentId = useActiveAssignmentId();
  const [activeAssignment] =
    api.assignment.getStudentAssignment.useSuspenseQuery(
      activeAssignmentId ?? "",
    );
  const problemId = useStore.use.activeProblemId();
  const problem =
    activeAssignment?.problems.find((p) => p.id === problemId) ?? null;
  return problem ?? activeAssignment?.problems[0] ?? null;
};

export const useReferenceSolution = (
  problemId: string | null,
): string | null => {
  return useStore(
    useShallow(({ referenceSolutions: { entities } }) =>
      problemId ? (entities[problemId] ?? null) : null,
    ),
  );
};

export const useUnsolvedProblems = (): Problem[] => {
  const activeAssignmentId = useActiveAssignmentId();
  const [activeAssignment] =
    api.assignment.getStudentAssignment.useSuspenseQuery(
      activeAssignmentId ?? "",
    );
  const [studentSolutions] =
    api.studentSolution.listStudentSolutions.useSuspenseQuery();
  if (!activeAssignment) return [];
  return activeAssignment.problems.filter((p) => {
    const studentSolution = studentSolutions.find(
      (s) =>
        s.problemId === p.id && s.studentAssignmentId === activeAssignment.id,
    );
    return studentSolution?.status !== "SOLVED";
  });
};

export const useActiveStudentSolution = (): StudentSolution | null => {
  const activeProblemId = useStore.use.activeProblemId();
  const activeAssignmentId = useActiveAssignmentId();
  const [studentSolutions] =
    api.studentSolution.listStudentSolutions.useSuspenseQuery();
  return (
    studentSolutions.find(
      (s) =>
        s.problemId === activeProblemId &&
        s.studentAssignmentId === activeAssignmentId,
    ) ?? null
  );
};

export const useProblemController = (): {
  nextProblem?: Problem;
  previousProblem?: Problem;
  gotoNextProblem: () => void;
  gotoNextUnsolvedProblem?: () => void;
  gotoPreviousProblem: () => void;
} => {
  const setActiveProblem = useSetActiveProblem();

  const activeAssignmentId = useActiveAssignmentId();
  const [activeAssignment] =
    api.assignment.getStudentAssignment.useSuspenseQuery(
      activeAssignmentId ?? "",
    );
  const [studentSolutions] =
    api.studentSolution.listStudentSolutions.useSuspenseQuery();
  const activeProblem = useActiveProblem();
  const activeProblemIndex = activeAssignment
    ? activeAssignment.problems.findIndex((p) => p.id === activeProblem?.id)
    : -1;

  const nextProblem =
    activeAssignment && activeProblemIndex >= 0
      ? activeAssignment.problems[activeProblemIndex + 1]
      : undefined;
  const isSolved = (problemId: string): boolean => {
    if (!activeAssignment) return false;
    const solution = studentSolutions.find(
      (s) =>
        s.problemId === problemId &&
        s.studentAssignmentId === activeAssignment.id,
    );
    return solution?.status === "SOLVED";
  };
  const nextUnsolvedProblem =
    activeAssignment && activeProblemIndex >= 0
      ? activeAssignment.problems
          .slice(activeProblemIndex + 1)
          .find((p) => !isSolved(p.id))
      : undefined;
  const previousProblem =
    activeAssignment && activeProblemIndex > 0
      ? activeAssignment.problems[activeProblemIndex - 1]
      : undefined;

  const gotoNextProblem = useCallback(() => {
    if (!nextProblem || !activeAssignment) return;
    void setActiveProblem(nextProblem.id, activeAssignment.id);
  }, [nextProblem, setActiveProblem, activeAssignment]);
  const gotoNextUnsolvedProblem = nextUnsolvedProblem
    ? () => {
        if (!activeAssignment) return;
        void setActiveProblem(nextUnsolvedProblem.id, activeAssignment.id);
      }
    : undefined;
  const gotoPreviousProblem = useCallback(() => {
    if (!previousProblem || !activeAssignment) return;
    void setActiveProblem(previousProblem.id, activeAssignment.id);
  }, [previousProblem, activeAssignment, setActiveProblem]);

  return {
    nextProblem,
    previousProblem,
    gotoNextProblem,
    gotoNextUnsolvedProblem,
    gotoPreviousProblem,
  };
};
