import { type Path } from "@/core/canvas/canvas.types";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { isEqual } from "lodash";
import { useCallback, useEffect, useState } from "react";

const DEBOUNCE_TIME = 30_000;
type ItemToSave = {
  problemId: string;
  studentAssignmentId: string;
  paths: Path[];
  savedPaths: Path[];
};

export function useSaveCanvas() {
  const paths = useStore.use.paths();
  const activeProblemId = useStore.use.activeProblemId();
  const activeAssignmentId = useStore.use.activeAssignmentId();
  const [itemsToSave, setItemsToSave] = useState<Map<string, ItemToSave>>(
    new Map(),
  );

  const q =
    activeProblemId && activeAssignmentId
      ? {
          problemId: activeProblemId,
          studentAssignmentId: activeAssignmentId,
        }
      : skipToken;
  const { data: savedItems } =
    api.studentSolution.getStudentSolution.useQuery(q);

  const utils = api.useUtils();

  const { mutate: updateStudentSolution } =
    api.studentSolution.setStudentSolutionCanvas.useMutation({
      onSuccess: (_, { canvas }) => {
        if (activeProblemId && activeAssignmentId) {
          utils.studentSolution.getStudentSolution.setData(
            {
              problemId: activeProblemId,
              studentAssignmentId: activeAssignmentId,
            },
            (prev) => {
              if (!prev) {
                return prev;
              }
              console.log("Updating cache", canvas);
              return { ...prev, canvas };
            },
          );
        }
      },
    });

  const addItemToMap = useCallback(
    (
      activeProblemId: string | null,
      activeAssignmentId: string | null,
      paths: Path[],
      savedPaths: Path[] | undefined,
    ) => {
      if (activeProblemId && activeAssignmentId && savedPaths) {
        console.log(
          "Adding item to map",
          activeProblemId,
          activeAssignmentId,
          paths.length,
          savedPaths.length,
        );
        setItemsToSave((prev) => {
          const newMap = new Map(prev);
          newMap.set(`${activeProblemId}-${activeAssignmentId}`, {
            problemId: activeProblemId,
            studentAssignmentId: activeAssignmentId,
            paths,
            savedPaths,
          });
          return newMap;
        });
      }
    },
    [],
  );

  useEffect(() => {
    addItemToMap(
      activeProblemId,
      activeAssignmentId,
      paths,
      savedItems?.canvas.paths,
    );
    return () => {
      addItemToMap(
        activeProblemId,
        activeAssignmentId,
        paths,
        savedItems?.canvas.paths,
      );
    };
  }, [activeProblemId, activeAssignmentId, paths, savedItems, addItemToMap]);

  useEffect(() => {
    Array.from(itemsToSave.values()).map(
      ({ problemId, studentAssignmentId, paths, savedPaths }) => {
        if (!isEqual(paths, savedPaths)) {
          console.log(
            "Updating student solution",
            problemId,
            studentAssignmentId,
            paths.length,
            savedPaths.length,
          );
          return updateStudentSolution({
            problemId,
            studentAssignmentId,
            canvas: {
              paths,
            },
          });
        }
      },
    );
  }, [itemsToSave, updateStudentSolution]);
}
