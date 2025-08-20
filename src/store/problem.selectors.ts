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
  const [studentProblems] =
    api.assignment.getStudentProblems.useSuspenseQuery();
  const problemId = useStore.use.activeProblemId();
  const problem = studentProblems?.find((p) => p.id === problemId) ?? null;
  return problem ?? studentProblems?.[0] ?? null;
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
  const [studentProblems] =
    api.assignment.getStudentProblems.useSuspenseQuery();
  const [studentSolutions] =
    api.studentSolution.listStudentSolutions.useSuspenseQuery();

  if (!studentProblems) return [];

  return studentProblems.filter((p) => {
    const studentSolution = studentSolutions.find((s) => s.problemId === p.id);
    return studentSolution?.status !== "SOLVED";
  });
};

export const useActiveStudentSolution = (): StudentSolution | null => {
  const activeProblemId = useStore.use.activeProblemId();
  const [studentSolutions] =
    api.studentSolution.listStudentSolutions.useSuspenseQuery();
  return studentSolutions.find((s) => s.problemId === activeProblemId) ?? null;
};

export const useProblemController = (): {
  nextProblem?: Problem;
  previousProblem?: Problem;
  gotoNextProblem: () => void;
  gotoNextUnsolvedProblem?: () => void;
  gotoPreviousProblem: () => void;
} => {
  const setActiveProblem = useSetActiveProblem();

  const [studentProblems] =
    api.assignment.getStudentProblems.useSuspenseQuery();
  const [studentSolutions] =
    api.studentSolution.listStudentSolutions.useSuspenseQuery();
  const activeProblem = useActiveProblem();

  const activeProblemIndex = studentProblems
    ? studentProblems.findIndex((p) => p.id === activeProblem?.id)
    : -1;

  const nextProblem =
    studentProblems && activeProblemIndex >= 0
      ? studentProblems[activeProblemIndex + 1]
      : undefined;

  const isSolved = (problemId: string): boolean => {
    const solution = studentSolutions.find((s) => s.problemId === problemId);
    return solution?.status === "SOLVED";
  };

  const nextUnsolvedProblem =
    studentProblems && activeProblemIndex >= 0
      ? studentProblems
          .slice(activeProblemIndex + 1)
          .find((p) => !isSolved(p.id))
      : undefined;

  const previousProblem =
    studentProblems && activeProblemIndex > 0
      ? studentProblems[activeProblemIndex - 1]
      : undefined;

  const gotoNextProblem = useCallback(() => {
    if (!nextProblem) return;
    void setActiveProblem(nextProblem.id, "default");
  }, [nextProblem, setActiveProblem]);

  const gotoNextUnsolvedProblem = nextUnsolvedProblem
    ? () => {
        void setActiveProblem(nextUnsolvedProblem.id, "default");
      }
    : undefined;

  const gotoPreviousProblem = useCallback(() => {
    if (!previousProblem) return;
    void setActiveProblem(previousProblem.id, "default");
  }, [previousProblem, setActiveProblem]);

  return {
    nextProblem,
    previousProblem,
    gotoNextProblem,
    gotoNextUnsolvedProblem,
    gotoPreviousProblem,
  };
};
