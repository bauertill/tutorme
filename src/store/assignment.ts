import { type Assignment, type UserProblem } from "@/core/assignment/types";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface AssignmentSlice {
  assignments: Assignment[];
  currentAssignmentId: string | null;
  currentProblemId: string | null;
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  setCurrentAssignment: (assignment: Assignment) => void;
  setCurrentProblem: (problem: UserProblem) => void;
}

export const createAssignmentSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  AssignmentSlice
> = (set) => ({
  assignments: [],
  currentAssignmentId: null,
  currentProblemId: null,
  setAssignments: (assignments: Assignment[]) =>
    set((draft) => {
      draft.assignments = assignments;
    }),
  addAssignment: (assignment: Assignment) =>
    set((draft) => {
      draft.assignments = [...draft.assignments, assignment];
    }),
  setCurrentAssignment: (assignment: Assignment) =>
    set((draft) => {
      draft.currentAssignmentId = assignment.id;
    }),
  setCurrentProblem: (problem: UserProblem) =>
    set((draft) => {
      draft.currentProblemId = problem.id;
    }),
});
