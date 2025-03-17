import { mergeAssignments } from "@/core/assignment/assignmentDomain";
import {
  type Assignment,
  type Canvas,
  type UserProblem,
} from "@/core/assignment/types";
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
  setReferenceSolution: (
    referenceSolution: string,
    problemId: string,
    assignmentId: string,
  ) => void;
  setCanvasOnProblem: (
    problemId: string,
    assignmentId: string,
    canvas: Canvas,
  ) => void;
  setProblem: (problem: UserProblem) => void;
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
    }),
  setActiveProblem: (problem: UserProblem) => {
    set((draft) => {
      draft.activeAssignmentId = problem.assignmentId;
      draft.activeProblemId = problem.id;
    });
  },
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
  // @TODO we need to implement an "updateProblem" function that will
  //  update the problem in the store and the updatedAt field
  setCanvasOnProblem: (
    problemId: string,
    assignmentId: string,
    canvas: Canvas,
  ) =>
    set((draft) => {
      const problem = draft.assignments
        .find((a) => a.id === assignmentId)
        ?.problems.find((p) => p.id === problemId);
      if (problem) {
        problem.canvas = canvas;
        problem.updatedAt = new Date();
      }
    }),
  setProblem: (problem: UserProblem) =>
    set((draft) => {
      const assignment = draft.assignments.find(
        (a) => a.id === problem.assignmentId,
      );
      if (assignment) {
        assignment.problems = assignment.problems.map((p) =>
          p.id === problem.id ? { ...problem, updatedAt: new Date() } : p,
        );
      }
    }),
});
