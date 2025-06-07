import { mergeAssignments } from "@/core/assignment/assignmentDomain";
import { type StudentAssignmentWithStudentSolutions } from "@/core/assignment/types";
import { type ProblemWithStudentSolution } from "@/core/problem/types";
import _ from "lodash";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface AssignmentSlice {
  assignments: StudentAssignmentWithStudentSolutions[];
  activeAssignmentId: string | null;
  activeProblemId: string | null;
  clearAssignments: () => void;
  upsertAssignments: (
    assignments: StudentAssignmentWithStudentSolutions[],
  ) => void;
  addAssignment: (assignment: StudentAssignmentWithStudentSolutions) => void;
  editAssignment: (assignment: StudentAssignmentWithStudentSolutions) => void;
  deleteAssignment: (assignmentId: string) => void;
  setActiveProblem: (problem: ProblemWithStudentSolution) => void;
  updateProblem: (
    problem: Partial<ProblemWithStudentSolution> & {
      id: string;
      assignmentId: string;
    },
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
  upsertAssignments: (assignments: StudentAssignmentWithStudentSolutions[]) =>
    set((draft) => {
      const mergedAssignments = mergeAssignments(
        draft.assignments,
        assignments,
      );
      if (!_.isEqual(draft.assignments, mergedAssignments)) {
        draft.assignments = mergedAssignments;
      }
    }),
  addAssignment: (assignment: StudentAssignmentWithStudentSolutions) => {
    set((draft) => {
      draft.assignments = [assignment, ...draft.assignments];
      draft.activeAssignmentId = assignment.id;
      draft.activeProblemId = assignment.problems[0]?.id ?? null;
    });
    get().setCanvas({ paths: [] });
  },
  editAssignment: (assignment: StudentAssignmentWithStudentSolutions) => {
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
  setActiveProblem: (problem: ProblemWithStudentSolution) => {
    set((draft) => {
      draft.activeAssignmentId = problem.assignmentId;
      draft.activeProblemId = problem.id;
    });
    get().setCanvas({ paths: [] });
  },

  updateProblem: (
    problem: Partial<ProblemWithStudentSolution> & {
      id: string;
      assignmentId: string;
    },
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
        problem.studentSolution.canvas = { paths: get().paths };
        problem.studentSolution.updatedAt = new Date();
      }
    });
  },
});
