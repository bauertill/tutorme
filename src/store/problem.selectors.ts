import { type StudentAssignment } from "@/core/assignment/assignment.types";
import { type Problem } from "@/core/problem/problem.types";
import { type StudentSolution } from "@/core/studentSolution/studentSolution.types";
import { useCallback, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useShallow } from "zustand/shallow";
import { useStore } from ".";
import { useActiveAssignment } from "./assignment.selectors";
import {
  useStudentSolution,
  useStudentSolutions,
} from "./studentSolution.selectors";

export const useActiveProblem = (): Problem | null => {
  const assignment = useActiveAssignment();
  const problemId = useStore.use.activeProblemId();
  const problem = assignment?.problems.find((p) => p.id === problemId) ?? null;
  return problem ?? assignment?.problems[0] ?? null;
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
  const activeAssignment = useActiveAssignment();
  const studentSolutions = useStudentSolutions();
  if (!activeAssignment) return [];
  return activeAssignment.problems.filter((p) => {
    const studentSolution = studentSolutions.find(
      (s) =>
        s.problemId === p.id && s.studentAssignmentId === activeAssignment.id,
    );
    return studentSolution?.status !== "SOLVED";
  });
};

export const useProblemController = (): {
  activeAssignment: StudentAssignment | null;
  activeProblem: Problem | null;
  activeStudentSolution: StudentSolution | null;
  nextProblem?: Problem;
  previousProblem?: Problem;
  gotoNextProblem: () => void;
  gotoNextUnsolvedProblem?: () => void;
  gotoPreviousProblem: () => void;
  setActiveProblemWithCanvas: (problem: Problem, assignmentId: string) => void;
} => {
  const setActiveProblem = useStore.use.setActiveProblem();
  const setCanvas = useStore.use.setCanvas();
  const paths = useStore.use.paths();
  const storeCurrentPathsOnStudentSolution =
    useStore.use.storeCurrentPathsOnStudentSolution();

  const activeAssignment = useActiveAssignment();
  const activeProblem = useActiveProblem();
  const activeProblemIndex =
    activeAssignment?.problems.findIndex((p) => p.id === activeProblem?.id) ??
    0;
  const studentSolutions = useStudentSolutions();
  const activeStudentSolution = useStudentSolution(
    activeProblem?.id ?? null,
    activeAssignment?.id ?? null,
  );

  const debouncedStorePaths = useDebouncedCallback(
    useCallback(() => {
      if (paths) storeCurrentPathsOnStudentSolution();
    }, [paths, storeCurrentPathsOnStudentSolution]),
    5000,
    { leading: true, trailing: true, maxWait: 5000 },
  );
  useEffect(debouncedStorePaths, [paths, debouncedStorePaths]);

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
    activeAssignment,
    activeProblem,
    activeStudentSolution,
    nextProblem,
    previousProblem,
    gotoNextProblem,
    gotoNextUnsolvedProblem,
    gotoPreviousProblem,
    setActiveProblemWithCanvas,
  };
};
