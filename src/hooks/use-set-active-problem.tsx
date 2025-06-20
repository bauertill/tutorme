import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { isEqual } from "lodash";
import { useCallback } from "react";

export function useSetActiveProblem() {
  const storeSetActiveProblem = useStore.use.setActiveProblem();
  const activeProblemId = useStore.use.activeProblemId();
  const activeAssignmentId = useStore.use.activeAssignmentId();
  const paths = useStore.use.paths();
  const setPaths = useStore.use.setPaths();
  const utils = api.useUtils();

  // save curent canvas to current studentsolution (activeproblem and activeassignment)
  const { mutate: saveCanvas } =
    api.studentSolution.setStudentSolutionCanvas.useMutation({
      onMutate: (updatedStudentSolution) => {
        // @TODO: only update the studentSolution that has changed
        utils.studentSolution.listStudentSolutions.setData(
          undefined,
          (existingSolutions) => {
            if (!existingSolutions) return existingSolutions;
            return existingSolutions.map((existingSolution) => {
              if (
                existingSolution.problemId ===
                  updatedStudentSolution.problemId &&
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

  const { data: studentSolutions } =
    api.studentSolution.listStudentSolutions.useQuery();

  const setActiveProblem = useCallback(
    async (problemId: string, assignmentId: string) => {
      if (!activeProblemId || !activeAssignmentId) return;
      const cachedCanvas = studentSolutions?.find(
        (solution) =>
          solution.problemId === activeProblemId &&
          solution.studentAssignmentId === activeAssignmentId,
      )?.canvas;

      const userHasChangedCanvas = !isEqual(paths, cachedCanvas?.paths);
      console.log("userHasChangedCanvas", userHasChangedCanvas);
      if (userHasChangedCanvas) {
        saveCanvas({
          problemId: activeProblemId,
          studentAssignmentId: activeAssignmentId,
          canvas: {
            paths: paths,
          },
        });
      }

      storeSetActiveProblem(problemId, assignmentId);

      // find canvas in cached studentsolution list
      const nextCachedCanvas = studentSolutions?.find(
        (solution) =>
          solution.problemId === problemId &&
          solution.studentAssignmentId === assignmentId,
      )?.canvas;

      // set current canvas to the canvas in the studentsolution
      setPaths(nextCachedCanvas?.paths ?? []);
    },
    [
      saveCanvas,
      paths,
      studentSolutions,
      setPaths,
      activeProblemId,
      activeAssignmentId,
      storeSetActiveProblem,
    ],
  );

  return setActiveProblem;
}
