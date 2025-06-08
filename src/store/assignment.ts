import { mergeAssignments } from "@/core/assignment/assignment.domain";
import { type StudentAssignment } from "@/core/assignment/assignment.types";
import _ from "lodash";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface AssignmentSlice {
  assignments: StudentAssignment[];
  activeAssignmentId: string | null;
  clearAssignments: () => void;
  upsertAssignments: (assignments: StudentAssignment[]) => void;
  addAssignment: (assignment: StudentAssignment) => void;
  editAssignment: (assignment: StudentAssignment) => void;
  deleteAssignment: (assignmentId: string) => void;
}

export const createAssignmentSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  AssignmentSlice
> = (set, get) => ({
  assignments: [],
  studentSolutions: [],
  activeAssignmentId: null,
  clearAssignments: () => {
    set((draft) => {
      draft.assignments = [];
    });
    get().setCanvas({ paths: [] });
  },
  upsertAssignments: (assignments: StudentAssignment[]) =>
    set((draft) => {
      const mergedAssignments = mergeAssignments(
        draft.assignments,
        assignments,
      );
      if (!_.isEqual(draft.assignments, mergedAssignments)) {
        draft.assignments = mergedAssignments;
      }
      const firstAssignment = draft.assignments[0];
      if (!draft.activeAssignmentId && firstAssignment) {
        draft.activeAssignmentId = firstAssignment.id;
        draft.activeProblemId = firstAssignment.problems[0]?.id ?? null;
      }
    }),
  addAssignment: (assignment: StudentAssignment) => {
    set((draft) => {
      draft.assignments = [assignment, ...draft.assignments];
      draft.activeAssignmentId = assignment.id;
      draft.activeProblemId = assignment.problems[0]?.id ?? null;
    });
    get().setCanvas({ paths: [] });
  },
  editAssignment: (assignment: StudentAssignment) => {
    set((draft) => {
      draft.assignments = draft.assignments.map((a) =>
        a.id === assignment.id ? assignment : a,
      );
    });
  },
  deleteAssignment: (assignmentId: string) => {
    set((draft) => {
      draft.assignments = draft.assignments.filter(
        (a) => a.id !== assignmentId,
      );
    });
  },
});
