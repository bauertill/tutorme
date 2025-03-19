import { mergeAssignments } from "@/core/assignment/assignmentDomain";
import { type Assignment, type UserProblem } from "@/core/assignment/types";
import _ from "lodash";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface AssignmentSlice {
  assignments: Assignment[];
  activeAssignmentId: string | null;
  activeProblemId: string | null;
  clearAssignments: () => void;
  upsertAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  setActiveProblem: (problem: UserProblem) => void;
  updateProblem: (
    problem: Partial<UserProblem> & { id: string; assignmentId: string },
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
  clearAssignments: () =>
    set((draft) => {
      draft.assignments = [];
    }),
  upsertAssignments: (assignments: Assignment[]) =>
    set((draft) => {
      const mergedAssignments = mergeAssignments(
        draft.assignments,
        assignments,
      );
      if (!_.isEqual(draft.assignments, mergedAssignments)) {
        draft.assignments = mergedAssignments;
      }
    }),
  addAssignment: (assignment: Assignment) =>
    set((draft) => {
      draft.assignments = [...draft.assignments, assignment];
      draft.activeAssignmentId = assignment.id;
      draft.activeProblemId = assignment.problems[0]?.id ?? null;
    }),
  setActiveProblem: (problem: UserProblem) => {
    set((draft) => {
      draft.activeAssignmentId = problem.assignmentId;
      draft.activeProblemId = problem.id;
    });
  },

  updateProblem: (
    problem: Partial<UserProblem> & { id: string; assignmentId: string },
  ) =>
    set((draft) => {
      const assignment = draft.assignments.find(
        (a) => a.id === problem.assignmentId,
      );
      if (assignment) {
        assignment.problems = assignment.problems.map((p) =>
          p.id === problem.id ? { ...p, ...problem, updatedAt: new Date() } : p,
        );
      }
    }),
});
