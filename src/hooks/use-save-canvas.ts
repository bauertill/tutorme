import { api } from "@/trpc/react";

export function useSaveCanvas() {
  const utils = api.useUtils();

  const mutation = api.studentSolution.setStudentSolutionCanvas.useMutation({
    onMutate: (updatedStudentSolution) => {
      // @TODO: only update the studentSolution that has changed
      utils.studentSolution.listStudentSolutions.setData(
        undefined,
        (existingSolutions) => {
          if (!existingSolutions) return existingSolutions;
          return existingSolutions.map((existingSolution) => {
            if (
              existingSolution.problemId === updatedStudentSolution.problemId &&
              existingSolution.studentAssignmentId ===
                updatedStudentSolution.studentAssignmentId
            ) {
              return {
                ...existingSolution,
                canvas: updatedStudentSolution.canvas,
              };
            }
            return existingSolution;
          });
        },
      );
    },
  });

  return mutation;
}
