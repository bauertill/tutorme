import { type Problem } from "@/core/problem/types";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface ProblemSlice {
  currentProblem: Problem | null;
  problems: Problem[];
  setCurrentProblem: (problem: Problem | null) => void;
}

export const createProblemSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  ProblemSlice
> = (set) => ({
  currentProblem: null,
  problems: [],
  setCurrentProblem: (problem: Problem | null) =>
    set((draft) => {
      draft.currentProblem = problem;
    }),
});
