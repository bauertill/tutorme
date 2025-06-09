import { type Problem } from "@/core/problem/problem.types";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface ProblemSlice {
  activeProblemId: string | null;
  referenceSolutions: {
    entities: Record<string, string>;
    ids: string[];
  };
  setActiveProblem: (problem: Problem, assignmentId: string) => void;
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
  setActiveProblem: (problem: Problem, assignmentId: string) => {
    get().storeCurrentPathsOnStudentSolution();
    set((draft) => {
      draft.activeAssignmentId = assignmentId;
      draft.activeProblemId = problem.id;
    });
    get().setCanvas({ paths: [] });
  },

  addReferenceSolution: (problemId: string, referenceSolution: string) => {
    set(({ referenceSolutions }) => {
      referenceSolutions.entities[problemId] = referenceSolution;
      referenceSolutions.ids = Object.keys(referenceSolutions.entities);
    });
  },
});
