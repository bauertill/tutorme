import { type Problem } from "@/core/problem/problem.types";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface ProblemSlice {
  activeProblemId: string | null;
  referenceSolutions: Record<string, string>;
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
  referenceSolutions: {},
  setActiveProblem: (problem: Problem, assignmentId: string) => {
    set((draft) => {
      draft.assignments.activeId = assignmentId;
      draft.activeProblemId = problem.id;
    });
    get().setCanvas({ paths: [] });
  },

  addReferenceSolution: (problemId: string, referenceSolution: string) => {
    set((draft) => {
      draft.referenceSolutions[problemId] = referenceSolution;
    });
  },
});
