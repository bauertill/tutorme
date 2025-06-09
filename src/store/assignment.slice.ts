import { mergeAssignments } from "@/core/assignment/assignment.domain";
import { type StudentAssignment } from "@/core/assignment/assignment.types";
import _ from "lodash";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface AssignmentSlice {
  assignments: {
    entities: Record<string, StudentAssignment>;
    ids: string[];
    activeId: string | null;
  };
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
  assignments: {
    entities: {},
    ids: [],
    activeId: null,
  },
  clearAssignments: () => {
    set((draft) => {
      draft.assignments = {
        entities: {},
        ids: [],
        activeId: null,
      };
    });
    get().setCanvas({ paths: [] });
    get().clearStudentSolutions();
  },
  upsertAssignments: (assignments: StudentAssignment[]) => {
    get().storeCurrentPathsOnStudentSolution();
    set((draft) => {
      const mergedAssignments = mergeAssignments(
        draft.assignments.entities,
        Object.fromEntries(assignments.map((a) => [a.id, a])),
      );
      if (!_.isEqual(draft.assignments.entities, mergedAssignments)) {
        draft.assignments = {
          entities: mergedAssignments,
          ids: Object.keys(mergedAssignments),
          activeId: draft.assignments.activeId,
        };
      }
      const firstAssignmentId = draft.assignments.ids[0];
      if (!draft.assignments.activeId && firstAssignmentId) {
        draft.assignments.activeId = firstAssignmentId;
        draft.activeProblemId =
          draft.assignments.entities[firstAssignmentId]?.problems[0]?.id ??
          null;
      }
    });
  },
  addAssignment: (assignment: StudentAssignment) => {
    get().upsertAssignments([assignment]);
    set((draft) => {
      draft.assignments.activeId = assignment.id;
      draft.activeProblemId = assignment.problems[0]?.id ?? null;
    });
    get().setCanvas({ paths: [] });
  },
  editAssignment: (assignment: StudentAssignment) => {
    get().upsertAssignments([assignment]);
  },
  deleteAssignment: (assignmentId: string) => {
    set((draft) => {
      const { assignments } = draft;
      if (assignments.activeId === assignmentId) {
        const firstAssignmentId = assignments.ids[0];
        if (firstAssignmentId) {
          assignments.activeId = firstAssignmentId;
          draft.activeProblemId =
            assignments.entities[firstAssignmentId]?.problems[0]?.id ?? null;
        } else {
          draft.assignments.activeId = null;
          draft.activeProblemId = null;
        }
      }
      delete assignments.entities[assignmentId];
      assignments.ids = Object.keys(assignments.entities);
    });
  },
});
