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
  editAssignment: (assignment: Assignment) => void;
  setActiveProblem: (problem: UserProblem) => void;
  updateProblem: (
    problem: Partial<UserProblem> & { id: string; assignmentId: string },
  ) => void;
  storeCurrentPathsOnProblem: () => void;
}

export const createAssignmentSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  AssignmentSlice
> = (set, get) => ({
  assignments: [],
  activeAssignmentId: null,
  activeProblemId: null,
  clearAssignments: () => {
    set((draft) => {
      draft.assignments = [];
    });
    get().setCanvas({ paths: [] });
  },
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
  addAssignment: (assignment: Assignment) => {
    set((draft) => {
      draft.assignments = [assignment, ...draft.assignments];
      draft.activeAssignmentId = assignment.id;
      draft.activeProblemId = assignment.problems[0]?.id ?? null;
    });
    get().setCanvas({ paths: [] });
  },
  editAssignment: (assignment: Assignment) => {
    set((draft) => {
      draft.assignments = draft.assignments.map((a) =>
        a.id === assignment.id ? assignment : a,
      );
    });
  },
  setActiveProblem: (problem: UserProblem) => {
    set((draft) => {
      draft.activeAssignmentId = problem.assignmentId;
      draft.activeProblemId = problem.id;
    });
    get().setCanvas({ paths: [] });
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
  storeCurrentPathsOnProblem: () => {
    set((draft) => {
      const problem = draft.assignments
        .find((a) => a.id === draft.activeAssignmentId)
        ?.problems.find((p) => p.id === draft.activeProblemId);
      if (problem) {
        problem.canvas = { paths: get().paths };
      }
    });
  },
});
