import { type StudentSolution } from "@/core/studentSolution/studentSolution.types";
import { api } from "@/trpc/react";
import { useShallow } from "zustand/shallow";
import { useStore } from ".";

export const useStudentSolutions = (): StudentSolution[] => {
  return useStore(
    useShallow((store) =>
      store.studentSolutions.ids
        .map((id) => store.studentSolutions.entities[id])
        .filter((s) => s !== undefined),
    ),
  );
};
export const useStudentSolutionsOnServer = (): StudentSolution[] => {
  const [studentSolutions] =
    api.studentSolution.listStudentSolutions.useSuspenseQuery();
  return studentSolutions;
};

export const useStudentSolution = (
  problemId: string | null,
  studentAssignmentId: string | null,
): StudentSolution | null => {
  return useStore(
    useShallow((store) => {
      const id = `${problemId}-${studentAssignmentId}`;
      return store.studentSolutions.entities[id] ?? null;
    }),
  );
};
