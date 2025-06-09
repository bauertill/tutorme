import {
  type EvaluationResult,
  type StudentSolution,
} from "@/core/studentSolution/studentSolution.types";
import { api } from "@/trpc/react";
import { useShallow } from "zustand/shallow";
import { useStore } from ".";
import { useActiveAssignmentId } from "./assignment.selectors";
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
export const useStudentSolutionsOnServer = (): StudentSolution[] => {
  const [studentSolutions] =
    api.studentSolution.listStudentSolutions.useSuspenseQuery();
  return studentSolutions;
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
  const activeAssignmentId = useActiveAssignmentId();
  const [activeAssignment] =
    api.assignment.getStudentAssignment.useSuspenseQuery(
      activeAssignmentId ?? "",
    );
  const studentSolution = useStudentSolution(
    activeProblem?.id ?? null,
    activeAssignment?.id ?? null,
  );
  const evaluationResult = studentSolution?.evaluation ?? null;
  const setEvaluationResult = useStore.use.setEvaluationResult();
  return { evaluationResult, setEvaluationResult };
};
