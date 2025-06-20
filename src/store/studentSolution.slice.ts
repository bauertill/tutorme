import { type StudentSolution } from "@/core/studentSolution/studentSolution.types";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface StudentSolutionSlice {
  studentSolutions: {
    entities: Record<string, StudentSolution>;
    ids: string[];
  };
  storeCurrentPathsOnStudentSolution: () => void;
  ensureStudentSolution: (problemId?: string, assignmentId?: string) => void;
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
    recommendedQuestions: [],
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
});
