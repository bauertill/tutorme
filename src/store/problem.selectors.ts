import { type StudentAssignment } from "@/core/assignment/assignment.types";
import { type Problem } from "@/core/problem/problem.types";
import { type StudentSolution } from "@/core/studentSolution/studentSolution.types";
import { useCallback, useEffect, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useStore } from ".";
import { useActiveAssignment } from "./assignment.selectors";

export const useActiveProblem = (): Problem | null => {
  const assignment = useActiveAssignment();
  const problemId = useStore.use.activeProblemId();
  const problem = assignment?.problems.find((p) => p.id === problemId) ?? null;
  return problem ?? assignment?.problems[0] ?? null;
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
  const studentSolutions = useStore.use.studentSolutions();
  const activeStudentSolution = useMemo(
    () =>
      studentSolutions.find(
        (s) =>
          s.problemId === activeProblem?.id &&
          s.studentAssignmentId === activeAssignment?.id,
      ) ?? null,
    [activeProblem, activeAssignment, studentSolutions],
  );

  const debouncedStorePaths = useDebouncedCallback(
    useCallback(() => {
      if (!activeProblem || !activeAssignment) return;
      storeCurrentPathsOnStudentSolution(
        activeProblem.id,
        activeAssignment.id,
        paths,
      );
    }, [
      activeProblem,
      activeAssignment,
      paths,
      storeCurrentPathsOnStudentSolution,
    ]),
    5000,
    { leading: true, trailing: true, maxWait: 5000 },
  );
  useEffect(debouncedStorePaths, [paths, debouncedStorePaths]);

  const nextProblem = activeAssignment?.problems[activeProblemIndex + 1];
  const nextUnsolvedProblem =
    activeAssignment?.problems.find((p, idx) => {
      const studentSolution = studentSolutions.find(
        (s) =>
          s.problemId === p.id &&
          s.studentAssignmentId === activeAssignment?.id,
      );
      return studentSolution?.status !== "SOLVED" && idx > activeProblemIndex;
    }) ??
    activeAssignment?.problems.find((p) => {
      const studentSolution = studentSolutions.find(
        (s) =>
          s.problemId === p.id &&
          s.studentAssignmentId === activeAssignment?.id,
      );
      return studentSolution?.status !== "SOLVED";
    });
  const previousProblem = activeAssignment?.problems[activeProblemIndex - 1];

  const gotoNextProblem = useCallback(() => {
    if (!nextProblem || !activeAssignment) return;
    storeCurrentPathsOnStudentSolution(
      activeProblem?.id ?? "",
      activeAssignment.id,
      paths,
    );
    setActiveProblem(nextProblem, activeAssignment.id);
    const studentSolution = studentSolutions.find(
      (s) =>
        s.problemId === nextProblem.id &&
        s.studentAssignmentId === activeAssignment.id,
    );
    setCanvas(studentSolution?.canvas ?? { paths: [] });
  }, [
    activeProblem,
    paths,
    nextProblem,
    setActiveProblem,
    setCanvas,
    storeCurrentPathsOnStudentSolution,
    activeAssignment,
    studentSolutions,
  ]);
  const gotoNextUnsolvedProblem = nextUnsolvedProblem
    ? () => {
        if (!activeAssignment) return;
        storeCurrentPathsOnStudentSolution(
          activeProblem?.id ?? "",
          activeAssignment.id,
          paths,
        );
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
    storeCurrentPathsOnStudentSolution(
      activeProblem?.id ?? "",
      activeAssignment.id,
      paths,
    );
    setActiveProblem(previousProblem, activeAssignment.id);
    const studentSolution = studentSolutions.find(
      (s) =>
        s.problemId === previousProblem.id &&
        s.studentAssignmentId === activeAssignment.id,
    );
    setCanvas(studentSolution?.canvas ?? { paths: [] });
  }, [
    activeProblem,
    paths,
    previousProblem,
    activeAssignment,
    setActiveProblem,
    setCanvas,
    storeCurrentPathsOnStudentSolution,
    studentSolutions,
  ]);

  const setActiveProblemWithCanvas = (
    problem: Problem,
    assignmentId: string,
  ) => {
    if (activeAssignment) {
      storeCurrentPathsOnStudentSolution(
        activeProblem?.id ?? "",
        activeAssignment.id,
        paths,
      );
    }
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
