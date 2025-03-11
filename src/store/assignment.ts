import { type Assignment, type UserProblem } from "@/core/assignment/types";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface AssignmentSlice {
  assignments: Assignment[];
  activeAssignmentId: string | null;
  activeProblemId: string | null;
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  setActiveAssignment: (assignment: Assignment) => void;
  setActiveProblem: (problem: UserProblem) => void;
  setReferenceSolution: (
    referenceSolution: string,
    problemId: string,
    assignmentId: string,
  ) => void;
}

export const createAssignmentSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  AssignmentSlice
> = (set) => ({
  assignments: [],
  activeAssignmentId: null,
  activeProblemId: null,
  setAssignments: (assignments: Assignment[]) =>
    set((draft) => {
      draft.assignments = assignments;
    }),
  addAssignment: (assignment: Assignment) =>
    set((draft) => {
      draft.assignments = [...draft.assignments, assignment];
    }),
  setActiveAssignment: (assignment: Assignment) =>
    set((draft) => {
      draft.activeAssignmentId = assignment.id;
    }),
  setActiveProblem: (problem: UserProblem) =>
    set((draft) => {
      draft.activeAssignmentId = problem.assignmentId;
      draft.activeProblemId = problem.id;
    }),
  setReferenceSolution: (
    referenceSolution: string,
    problemId: string,
    assignmentId: string,
  ) =>
    set((draft) => {
      const problem = draft.assignments
        .find((a) => a.id === assignmentId)
        ?.problems.find((p) => p.id === problemId);
      if (problem) {
        problem.referenceSolution = referenceSolution;
      }
    }),
});
