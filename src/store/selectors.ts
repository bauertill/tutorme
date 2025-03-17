import {
  type Assignment,
  type EvaluationResult,
  type UserProblem,
} from "@/core/assignment/types";
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
  setActiveProblemWithCanvas: (problem: UserProblem) => void;
} => {
  const assignments = useStore.use.assignments();
  const activeAssignmentId = useStore.use.activeAssignmentId();
  const activeProblemId = useStore.use.activeProblemId();
  const setActiveProblem = useStore.use.setActiveProblem();
  const setCanvas = useStore.use.setCanvas();
  const updateProblem = useStore.use.updateProblem();
  const currentPaths = useStore.use.paths();

  const activeAssignment = assignments.find((a) => a.id === activeAssignmentId);
  const activeProblem = activeAssignment?.problems.find(
    (p) => p.id === activeProblemId,
  );
  const activeProblemIndex =
    activeAssignment?.problems.findIndex((p) => p.id === activeProblemId) ?? 0;

  const nextProblem = activeAssignment?.problems[activeProblemIndex + 1];
  const previousProblem = activeAssignment?.problems[activeProblemIndex - 1];

  const storeCurrentPathsOnProblem = () =>
    updateProblem({
      id: activeProblemId ?? "",
      assignmentId: activeAssignmentId ?? "",
      canvas: { paths: currentPaths },
    });

  const gotoNextProblem = nextProblem
    ? () => {
        storeCurrentPathsOnProblem();
        setActiveProblem(nextProblem);
        setCanvas(nextProblem.canvas ?? { paths: [] });
      }
    : undefined;
  const gotoPreviousProblem = previousProblem
    ? () => {
        storeCurrentPathsOnProblem();
        setActiveProblem(previousProblem);
        setCanvas(previousProblem.canvas ?? { paths: [] });
      }
    : undefined;

  const setActiveProblemWithCanvas = (problem: UserProblem) => {
    storeCurrentPathsOnProblem();
    setActiveProblem(problem);
    setCanvas(problem.canvas ?? { paths: [] });
  };

  return {
    activeAssignment,
    activeProblem,
    gotoNextProblem,
    gotoPreviousProblem,
    setActiveProblemWithCanvas,
  };
};

export const useEvaluationResult = (): {
  evaluationResult: EvaluationResult | null;
  setEvaluationResult: (
    problemId: string,
    evaluationResult: EvaluationResult,
  ) => void;
} => {
  const activeProblem = useActiveProblem();
  const updateProblem = useStore.use.updateProblem();
  const evaluationResult = activeProblem?.evaluation ?? null;
  if (!activeProblem) {
    return { evaluationResult, setEvaluationResult: () => null };
  }
  const setEvaluationResult = (
    problemId: string,
    evaluationResult: EvaluationResult,
  ) => {
    if (activeProblem.id !== problemId) {
      return;
    }
    const newProblem: UserProblem = {
      ...activeProblem,
      evaluation: evaluationResult,
      updatedAt: new Date(),
    };
    const isCorrect =
      evaluationResult.isComplete && !evaluationResult.hasMistakes;
    if (isCorrect) newProblem.status = "SOLVED";
    else newProblem.status = "IN_PROGRESS";
    updateProblem(newProblem);
  };
  return { evaluationResult, setEvaluationResult };
};
