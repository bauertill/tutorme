import {
  type EvaluationResult,
  type StudentSolution,
} from "@/core/studentSolution/studentSolution.types";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";
import { type Path } from "./canvas.slice";

export interface StudentSolutionSlice {
  studentSolutions: {
    entities: Record<string, StudentSolution>;
    idByProblemAndAssignmentId: Record<string, string>;
    ids: string[];
  };
  storeCurrentPathsOnStudentSolution: (
    problemId: string,
    assignmentId: string,
    paths: Path[],
  ) => void;
  upsertStudentSolutions: (studentSolutions: StudentSolution[]) => void;
  setEvaluationResult: (
    problemId: string,
    studentAssignmentId: string,
    evaluationResult: EvaluationResult,
  ) => void;
}

export const createStudentSolutionSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  StudentSolutionSlice
> = (set) => ({
  studentSolutions: {
    entities: {},
    idByProblemAndAssignmentId: {},
    ids: [],
  },
  storeCurrentPathsOnStudentSolution: (
    problemId: string,
    assignmentId: string,
    paths: Path[],
  ) => {
    set((draft) => {
      if (!draft.activeProblemId || !draft.assignments.activeId) return;
      const id =
        draft.studentSolutions.idByProblemAndAssignmentId[
          `${problemId}-${assignmentId}`
        ];
      const studentSolution = id ? draft.studentSolutions.entities[id] : null;
      if (!id || !studentSolution) {
        const newId = crypto.randomUUID();
        draft.studentSolutions.entities[newId] = {
          id: newId,
          problemId,
          studentAssignmentId: assignmentId,
          createdAt: new Date(),
          status: "INITIAL",
          evaluation: null,
          canvas: { paths },
          updatedAt: new Date(),
        };
        draft.studentSolutions.idByProblemAndAssignmentId[
          `${problemId}-${assignmentId}`
        ] = newId;
        draft.studentSolutions.ids.push(newId);
      } else {
        studentSolution.canvas = { paths };
        studentSolution.updatedAt = new Date();
      }
    });
  },
  upsertStudentSolutions: (studentSolutions: StudentSolution[]) =>
    set((draft) => {
      draft.studentSolutions.entities = {
        ...draft.studentSolutions.entities,
        ...Object.fromEntries(studentSolutions.map((s) => [s.id, s])),
      };
      draft.studentSolutions.idByProblemAndAssignmentId = Object.fromEntries(
        studentSolutions.map((s) => [
          `${s.problemId}-${s.studentAssignmentId}`,
          s.id,
        ]),
      );
      draft.studentSolutions.ids = Object.keys(draft.studentSolutions.entities);
    }),
  setEvaluationResult: (
    problemId: string,
    studentAssignmentId: string,
    evaluationResult: EvaluationResult,
  ) =>
    set((draft) => {
      const id =
        draft.studentSolutions.idByProblemAndAssignmentId[
          `${problemId}-${studentAssignmentId}`
        ];
      if (!id) return;
      const studentSolution = draft.studentSolutions.entities[id];
      if (!studentSolution) return;
      studentSolution.evaluation = evaluationResult;
      studentSolution.updatedAt = new Date();
      const isCorrect =
        evaluationResult.isComplete && !evaluationResult.hasMistakes;
      if (isCorrect) studentSolution.status = "SOLVED";
      else studentSolution.status = "IN_PROGRESS";
    }),
});
