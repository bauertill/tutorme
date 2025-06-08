import { type StudentSolution } from "@/core/studentSolution/studentSolution.types";
import _ from "lodash";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";
import { type Path } from "./canvas.slice";

export interface StudentSolutionSlice {
  studentSolutions: StudentSolution[];
  storeCurrentPathsOnStudentSolution: (
    problemId: string,
    assignmentId: string,
    paths: Path[],
  ) => void;
  upsertStudentSolutions: (studentSolutions: StudentSolution[]) => void;
}

export const createStudentSolutionSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  StudentSolutionSlice
> = (set) => ({
  studentSolutions: [],
  storeCurrentPathsOnStudentSolution: (
    problemId: string,
    assignmentId: string,
    paths: Path[],
  ) => {
    set((draft) => {
      if (!draft.activeProblemId || !draft.assignments.activeId) return;
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
});
