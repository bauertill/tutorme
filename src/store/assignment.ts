import { mergeAssignments } from "@/core/assignment/assignmentDomain";
import { type StudentAssignment } from "@/core/assignment/types";
import { type Problem } from "@/core/problem/types";
import { type StudentSolution } from "@/core/studentSolution/types";
import _ from "lodash";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";
import { type Path } from "./canvas";

export interface AssignmentSlice {
  assignments: StudentAssignment[];
  studentSolutions: StudentSolution[];
  activeAssignmentId: string | null;
  activeProblemId: string | null;
  referenceSolutions: Record<string, string>;
  clearAssignments: () => void;
  upsertAssignments: (assignments: StudentAssignment[]) => void;
  addAssignment: (assignment: StudentAssignment) => void;
  editAssignment: (assignment: StudentAssignment) => void;
  deleteAssignment: (assignmentId: string) => void;
  setActiveProblem: (problem: Problem, assignmentId: string) => void;
  storeCurrentPathsOnStudentSolution: (
    problemId: string,
    assignmentId: string,
    paths: Path[],
  ) => void;
  upsertStudentSolutions: (studentSolutions: StudentSolution[]) => void;
  addReferenceSolution: (problemId: string, referenceSolution: string) => void;
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
  referenceSolutions: {},
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
  setActiveProblem: (problem: Problem, assignmentId: string) => {
    set((draft) => {
      draft.activeAssignmentId = assignmentId;
      draft.activeProblemId = problem.id;
    });
    get().setCanvas({ paths: [] });
  },

  storeCurrentPathsOnStudentSolution: (
    problemId: string,
    assignmentId: string,
    paths: Path[],
  ) => {
    set((draft) => {
      if (!draft.activeProblemId || !draft.activeAssignmentId) return;
      const studentSolution = draft.studentSolutions.find(
        (s) =>
          s.problemId === problemId && s.studentAssignmentId === assignmentId,
      );
      if (!studentSolution) {
        draft.studentSolutions = [
          ...draft.studentSolutions,
          {
            id: crypto.randomUUID(),
            problemId,
            studentAssignmentId: assignmentId,
            createdAt: new Date(),
            status: "INITIAL",
            evaluation: null,
            canvas: { paths },
            updatedAt: new Date(),
          },
        ];
      } else {
        studentSolution.canvas = { paths };
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
  addReferenceSolution: (problemId: string, referenceSolution: string) => {
    set((draft) => {
      draft.referenceSolutions[problemId] = referenceSolution;
    });
  },
});
