import {
  type EvaluationResult,
  type StudentSolution,
} from "@/core/studentSolution/studentSolution.types";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface StudentSolutionSlice {
  studentSolutions: {
    entities: Record<string, StudentSolution>;
    ids: string[];
  };
  clearStudentSolutions: () => void;
  storeCurrentPathsOnStudentSolution: () => void;
  ensureStudentSolution: (problemId?: string, assignmentId?: string) => void;
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
    ids: [],
  },
  clearStudentSolutions: () => {
    set((draft) => {
      draft.studentSolutions = {
        entities: {},
        ids: [],
      };
    });
  },
  storeCurrentPathsOnStudentSolution: () => {
    get().ensureStudentSolution();
    set((draft) => {
      const { activeProblemId, activeAssignmentId, paths } = draft;
      if (!activeProblemId || !activeAssignmentId) return;
      const id = `${activeProblemId}-${activeAssignmentId}`;
      const studentSolution = id ? draft.studentSolutions.entities[id] : null;
      if (studentSolution) {
        studentSolution.canvas = { paths };
        studentSolution.updatedAt = new Date();
      }
    });
  },
  ensureStudentSolution: () => {
    set(({ studentSolutions, activeProblemId, activeAssignmentId }) => {
      if (!activeProblemId || !activeAssignmentId) {
        return;
      }
      const id = `${activeProblemId}-${activeAssignmentId}`;
      if (!studentSolutions.entities[id]) {
        const newSolution = newStudentSolution(
          activeProblemId,
          activeAssignmentId,
        );
        studentSolutions.entities[id] = newSolution;
        studentSolutions.ids.push(id);
      }
    });
  },
  upsertStudentSolutions: (solutions: StudentSolution[]) =>
    set(({ studentSolutions }) => {
      studentSolutions.entities = {
        ...studentSolutions.entities,
        ...Object.fromEntries(
          solutions.map((s) => [`${s.problemId}-${s.studentAssignmentId}`, s]),
        ),
      };
      studentSolutions.ids = Object.keys(studentSolutions.entities);
    }),
  setEvaluationResult: (
    problemId: string,
    studentAssignmentId: string,
    evaluationResult: EvaluationResult,
  ) =>
    set(({ studentSolutions }) => {
      const id = `${problemId}-${studentAssignmentId}`;
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
