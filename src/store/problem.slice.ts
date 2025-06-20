import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface ProblemSlice {
  activeProblemId: string | null;
  referenceSolutions: {
    entities: Record<string, string>;
    ids: string[];
  };
  setActiveProblem: (problemId: string, assignmentId: string) => void;
  addReferenceSolution: (problemId: string, referenceSolution: string) => void;
}

export const createProblemSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  ProblemSlice
> = (set, get) => ({
  activeProblemId: null,
  referenceSolutions: {
    entities: {},
    ids: [],
  },
  setActiveProblem: (problemId: string, assignmentId: string) => {
    set((draft) => {
      draft.activeAssignmentId = assignmentId;
      draft.activeProblemId = problemId;
    });
    get().setPaths([]);
  },

  addReferenceSolution: (problemId: string, referenceSolution: string) => {
    set(({ referenceSolutions }) => {
      referenceSolutions.entities[problemId] = referenceSolution;
      referenceSolutions.ids = Object.keys(referenceSolutions.entities);
    });
  },
});
