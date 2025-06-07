import { mergeAssignments } from "@/core/assignment/assignmentDomain";
import { type StudentAssignment } from "@/core/assignment/types";
import { type Problem, type StudentSolution } from "@/core/problem/types";
import _ from "lodash";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface AssignmentSlice {
  assignments: StudentAssignment[];
  studentSolutions: StudentSolution[];
  activeAssignmentId: string | null;
  activeProblemId: string | null;
  clearAssignments: () => void;
  upsertAssignments: (assignments: StudentAssignment[]) => void;
  addAssignment: (assignment: StudentAssignment) => void;
  editAssignment: (assignment: StudentAssignment) => void;
  deleteAssignment: (assignmentId: string) => void;
  setActiveProblem: (problem: Problem, assignmentId: string) => void;
  storeCurrentPathsOnStudentSolution: () => void;
  upsertStudentSolutions: (studentSolutions: StudentSolution[]) => void;
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
  activeProblemId: null,
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
  setActiveProblem: (problem: Problem, assignmentId: string) => {
    set((draft) => {
      draft.activeAssignmentId = assignmentId;
      draft.activeProblemId = problem.id;
    });
    get().setCanvas({ paths: [] });
  },

  storeCurrentPathsOnStudentSolution: () => {
    set((draft) => {
      const studentSolution = draft.studentSolutions.find(
        (s) =>
          s.problemId === draft.activeProblemId &&
          s.studentAssignmentId === draft.activeAssignmentId,
      );
      if (studentSolution) {
        studentSolution.canvas = { paths: get().paths };
        studentSolution.updatedAt = new Date();
      }
    });
  },
  upsertStudentSolutions: (studentSolutions: StudentSolution[]) =>
    set((draft) => {
      draft.studentSolutions = _.uniqBy(
        [...studentSolutions, ...draft.studentSolutions],
        (s) => s.id,
      );
    }),
});
