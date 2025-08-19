import { useStore } from "@/store";
import { api } from "@/trpc/react";
// import { isEqual } from "lodash";
import { useCallback } from "react";
// import { useSaveCanvas } from "./use-save-canvas";

export function useSetActiveProblem() {
  const storeSetActiveProblem = useStore.use.setActiveProblem();
  // const activeProblemId = useStore.use.activeProblemId();
  // const activeAssignmentId = useStore.use.activeAssignmentId();
  // const paths = useStore.use.paths();
  const setPaths = useStore.use.setPaths();

  // const { mutate: saveCanvas } = useSaveCanvas();

  const { data: studentSolutions } =
    api.studentSolution.listStudentSolutions.useQuery();

  const setActiveProblem = useCallback(
    async (problemId: string, assignmentId: string) => {
      storeSetActiveProblem(problemId, assignmentId);

      // find canvas in cached studentsolution list
      const nextCachedCanvas = studentSolutions?.find(
        (solution) =>
          solution.problemId === problemId &&
          solution.studentAssignmentId === assignmentId,
      )?.canvas;

      if (nextCachedCanvas?.paths && nextCachedCanvas.paths.length > 0) {
        setPaths(nextCachedCanvas.paths);
      } else {
        setPaths([]);
      }
    },
    [studentSolutions, setPaths, storeSetActiveProblem],
  );

  return setActiveProblem;
}
