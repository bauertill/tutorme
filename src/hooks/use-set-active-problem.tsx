import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { isEqual } from "lodash";
import { useCallback } from "react";
import { useSaveCanvas } from "./use-save-canvas";

export function useSetActiveProblem() {
  const storeSetActiveProblem = useStore.use.setActiveProblem();
  const activeProblemId = useStore.use.activeProblemId();
  const activeAssignmentId = useStore.use.activeAssignmentId();
  const paths = useStore.use.paths();
  const setPaths = useStore.use.setPaths();

  const { mutate: saveCanvas } = useSaveCanvas();

  const { data: studentSolutions } =
    api.studentSolution.listStudentSolutions.useQuery();

  const setActiveProblem = useCallback(
    async (problemId: string, assignmentId: string) => {
      if (activeProblemId && activeAssignmentId) {
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
      }

      storeSetActiveProblem(problemId, assignmentId);

      // find canvas in cached studentsolution list
      const nextCachedCanvas = studentSolutions?.find(
        (solution) =>
          solution.problemId === problemId &&
          solution.studentAssignmentId === assignmentId,
      )?.canvas;

      if (nextCachedCanvas?.paths) {
        setPaths(nextCachedCanvas.paths);
      }
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
