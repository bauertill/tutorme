import { type Problem } from "@/core/problem/problem.types";
import { type StudentSolution } from "@/core/studentSolution/studentSolution.types";
import { api } from "@/trpc/react";
import { useCallback } from "react";
import { useShallow } from "zustand/shallow";
import { useStore } from ".";
import { useActiveAssignmentId } from "./assignment.selectors";

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
  setActiveProblemWithCanvas: (problem: Problem, assignmentId: string) => void;
} => {
  const setActiveProblem = useStore.use.setActiveProblem();
  const setCanvas = useStore.use.setCanvas();

  const activeAssignmentId = useActiveAssignmentId();
  const [activeAssignment] =
    api.assignment.getStudentAssignment.useSuspenseQuery(
      activeAssignmentId ?? "",
    );
  const activeProblem = useActiveProblem();
  const activeProblemIndex =
    activeAssignment?.problems.findIndex((p) => p.id === activeProblem?.id) ??
    0;
  const [studentSolutions] =
    api.studentSolution.listStudentSolutions.useSuspenseQuery();

  const nextProblem = activeAssignment?.problems[activeProblemIndex + 1];
  const unsolvedProblems = useUnsolvedProblems();
  const nextUnsolvedProblem = unsolvedProblems[0];
  const previousProblem = activeAssignment?.problems[activeProblemIndex - 1];

  const gotoNextProblem = useCallback(() => {
    if (!nextProblem || !activeAssignment) return;
    setActiveProblem(nextProblem, activeAssignment.id);
    const studentSolution = studentSolutions.find(
      (s) =>
        s.problemId === nextProblem.id &&
        s.studentAssignmentId === activeAssignment.id,
    );
    setCanvas(studentSolution?.canvas ?? { paths: [] });
  }, [
    nextProblem,
    setActiveProblem,
    setCanvas,
    activeAssignment,
    studentSolutions,
  ]);
  const gotoNextUnsolvedProblem = nextUnsolvedProblem
    ? () => {
        if (!activeAssignment) return;
        setActiveProblem(nextUnsolvedProblem, activeAssignment.id);
        const studentSolution = studentSolutions.find(
          (s) =>
            s.problemId === nextUnsolvedProblem.id &&
            s.studentAssignmentId === activeAssignment.id,
        );
        setCanvas(studentSolution?.canvas ?? { paths: [] });
      }
    : undefined;
  const gotoPreviousProblem = useCallback(() => {
    if (!previousProblem || !activeAssignment) return;
    setActiveProblem(previousProblem, activeAssignment.id);
    const studentSolution = studentSolutions.find(
      (s) =>
        s.problemId === previousProblem.id &&
        s.studentAssignmentId === activeAssignment.id,
    );
    setCanvas(studentSolution?.canvas ?? { paths: [] });
  }, [
    previousProblem,
    activeAssignment,
    setActiveProblem,
    setCanvas,
    studentSolutions,
  ]);

  const setActiveProblemWithCanvas = (
    problem: Problem,
    assignmentId: string,
  ) => {
    setActiveProblem(problem, assignmentId);
    const studentSolution = studentSolutions.find(
      (s) =>
        s.problemId === problem.id && s.studentAssignmentId === assignmentId,
    );
    setCanvas(studentSolution?.canvas ?? { paths: [] });
  };

  return {
    nextProblem,
    previousProblem,
    gotoNextProblem,
    gotoNextUnsolvedProblem,
    gotoPreviousProblem,
    setActiveProblemWithCanvas,
  };
};
