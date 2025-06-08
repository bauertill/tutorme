import {
  type EvaluationResult,
  type StudentSolution,
} from "@/core/studentSolution/studentSolution.types";
import { useStore } from ".";
import { useActiveAssignment } from "./assignment.selectors";
import { useActiveProblem } from "./problem.selectors";

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
  const upsertStudentSolutions = useStore.use.upsertStudentSolutions();
  const studentSolutions = useStore.use.studentSolutions();
  const evaluationResult =
    studentSolutions.find(
      (s) =>
        s.problemId === activeProblem?.id &&
        s.studentAssignmentId === activeAssignment?.id,
    )?.evaluation ?? null;
  if (!activeProblem) {
    return { evaluationResult, setEvaluationResult: () => null };
  }
  const setEvaluationResult = (
    problemId: string,
    studentAssignmentId: string,
    evaluationResult: EvaluationResult,
  ) => {
    const studentSolution = studentSolutions.find(
      (s) =>
        s.problemId === problemId &&
        s.studentAssignmentId === studentAssignmentId,
    );
    if (!studentSolution) {
      return;
    }
    const newStudentSolution: StudentSolution = {
      ...studentSolution,
      evaluation: evaluationResult,
      updatedAt: new Date(),
    };
    const isCorrect =
      evaluationResult.isComplete && !evaluationResult.hasMistakes;
    if (isCorrect) newStudentSolution.status = "SOLVED";
    else newStudentSolution.status = "IN_PROGRESS";
    upsertStudentSolutions([newStudentSolution]);
  };
  return { evaluationResult, setEvaluationResult };
};
