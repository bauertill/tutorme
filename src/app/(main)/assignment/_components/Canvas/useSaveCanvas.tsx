import { type Path } from "@/core/canvas/canvas.types";
import { api } from "@/trpc/react";
import { isEqual } from "lodash";
import { useEffect, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";

type SaveableItem = {
  problemId: string;
  studentAssignmentId: string;
  paths: Path[];
};

const DEBOUNCE_TIME = 30_000;

// Persistently saves canvas drawing paths to the backend while throttling
// network traffic via a debounced mutation.
export function useSaveCanvas({
  problemId,
  studentAssignmentId,
  paths,
}: {
  problemId: string | null;
  studentAssignmentId: string | null;
  paths: Path[];
}) {
  const { mutateAsync: saveCanvas } =
    api.studentSolution.setStudentSolutionCanvas.useMutation();

  // Keeps track of the initial state or the most recent state that has successfully reached the server.
  const savedStudentProblems = useRef<Record<string, SaveableItem>>({});
  // Tracks the latest local edits which might still need syncing.
  const localStudentProblems = useRef<Record<string, SaveableItem>>({});

  // Debounced function responsible for actually performing the save.
  const debouncedSaveCanvas = useDebouncedCallback(
    async () => {
      if (!problemId || !studentAssignmentId) return;

      // Collect only those canvases that have changed since the last successful save.
      const changedStudentProblems = Object.entries(
        localStudentProblems.current,
      )
        .filter(
          ([key, value]) => !isEqual(value, savedStudentProblems.current[key]),
        )
        .map(([, value]) => value);

      // Persist all changed canvases in parallel.
      await Promise.all(
        changedStudentProblems.map(
          async ({ problemId, studentAssignmentId, paths }) => {
            await saveCanvas({
              problemId,
              studentAssignmentId,
              canvas: { paths },
            });
            // Update baseline so we don't resend identical data.
            savedStudentProblems.current[
              `${problemId}-${studentAssignmentId}`
            ] = {
              problemId,
              studentAssignmentId,
              paths,
            };
          },
        ),
      );
    },
    DEBOUNCE_TIME,
    { leading: true, trailing: true, maxWait: DEBOUNCE_TIME },
  );

  // Record every local change and schedule a (debounced) save.
  useEffect(() => {
    if (!problemId || !studentAssignmentId) return;
    if (!savedStudentProblems.current[`${problemId}-${studentAssignmentId}`]) {
      savedStudentProblems.current[`${problemId}-${studentAssignmentId}`] = {
        problemId,
        studentAssignmentId,
        paths,
      };
    } else {
      localStudentProblems.current[`${problemId}-${studentAssignmentId}`] = {
        problemId,
        studentAssignmentId,
        paths,
      };
    }
    void debouncedSaveCanvas();
  }, [debouncedSaveCanvas, problemId, studentAssignmentId, paths]);
}
