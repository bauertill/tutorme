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
  ensureStudentSolution: (problemId: string, assignmentId: string) => void;
  upsertStudentSolutions: (studentSolutions: StudentSolution[]) => void;
  setEvaluationResult: (
    problemId: string,
    studentAssignmentId: string,
    evaluationResult: EvaluationResult,
  ) => void;
}

const newStudentSolution = (
  problemId: string,
  studentAssignmentId: string,
): StudentSolution => {
  return {
    id: crypto.randomUUID(),
    problemId,
    studentAssignmentId,
    createdAt: new Date(),
    status: "INITIAL",
    evaluation: null,
    canvas: { paths: [] },
    updatedAt: new Date(),
  };
};

export const createStudentSolutionSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  StudentSolutionSlice
> = (set, get) => ({
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
    get().ensureStudentSolution(problemId, assignmentId);
    set((draft) => {
      if (!draft.activeProblemId || !draft.assignments.activeId) return;
      const id =
        draft.studentSolutions.idByProblemAndAssignmentId[
          `${problemId}-${assignmentId}`
        ];
      const studentSolution = id ? draft.studentSolutions.entities[id] : null;
      if (studentSolution) {
        studentSolution.canvas = { paths };
        studentSolution.updatedAt = new Date();
      }
    });
  },
  ensureStudentSolution: (problemId: string, assignmentId: string) => {
    set(({ studentSolutions }) => {
      const id =
        studentSolutions.idByProblemAndAssignmentId[
          `${problemId}-${assignmentId}`
        ];
      if (!id) {
        const newSolution = newStudentSolution(problemId, assignmentId);
        studentSolutions.entities[newSolution.id] = newSolution;
        studentSolutions.idByProblemAndAssignmentId[
          `${problemId}-${assignmentId}`
        ] = newSolution.id;
        studentSolutions.ids.push(newSolution.id);
      }
    });
  },
  upsertStudentSolutions: (solutions: StudentSolution[]) =>
    set(({ studentSolutions }) => {
      studentSolutions.entities = {
        ...studentSolutions.entities,
        ...Object.fromEntries(solutions.map((s) => [s.id, s])),
      };
      studentSolutions.idByProblemAndAssignmentId = Object.fromEntries(
        solutions.map((s) => [`${s.problemId}-${s.studentAssignmentId}`, s.id]),
      );
      studentSolutions.ids = Object.keys(studentSolutions.entities);
    }),
  setEvaluationResult: (
    problemId: string,
    studentAssignmentId: string,
    evaluationResult: EvaluationResult,
  ) =>
    set(({ studentSolutions }) => {
      const id =
        studentSolutions.idByProblemAndAssignmentId[
          `${problemId}-${studentAssignmentId}`
        ];
      if (!id) return;
      const studentSolution = studentSolutions.entities[id];
      if (!studentSolution) return;
      studentSolution.evaluation = evaluationResult;
      studentSolution.updatedAt = new Date();
      const isCorrect =
        evaluationResult.isComplete && !evaluationResult.hasMistakes;
      if (isCorrect) studentSolution.status = "SOLVED";
      else studentSolution.status = "IN_PROGRESS";
    }),
});
