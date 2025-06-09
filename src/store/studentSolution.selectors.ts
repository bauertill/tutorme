import {
  type EvaluationResult,
  type StudentSolution,
} from "@/core/studentSolution/studentSolution.types";
import { useShallow } from "zustand/shallow";
import { useStore } from ".";
import { useActiveAssignment } from "./assignment.selectors";
import { useActiveProblem } from "./problem.selectors";

export const useStudentSolutions = (): StudentSolution[] => {
  return useStore(
    useShallow((store) =>
      store.studentSolutions.ids
        .map((id) => store.studentSolutions.entities[id])
        .filter((s) => s !== undefined),
    ),
  );
};

export const useStudentSolution = (
  problemId: string | null,
  studentAssignmentId: string | null,
): StudentSolution | null => {
  return useStore(
    useShallow((store) => {
      const id = `${problemId}-${studentAssignmentId}`;
      return store.studentSolutions.entities[id] ?? null;
    }),
  );
};

export const useEvaluationResult = (): {
  evaluationResult: EvaluationResult | null;
  setEvaluationResult: (
    problemId: string,
    studentAssignmentId: string,
    evaluationResult: EvaluationResult,
  ) => void;
} => {
  const activeProblem = useActiveProblem();
  const activeAssignment = useActiveAssignment();
  const studentSolution = useStudentSolution(
    activeProblem?.id ?? null,
    activeAssignment?.id ?? null,
  );
  const evaluationResult = studentSolution?.evaluation ?? null;
  const setEvaluationResult = useStore.use.setEvaluationResult();
  return { evaluationResult, setEvaluationResult };
};
