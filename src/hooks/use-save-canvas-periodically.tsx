import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { isEqual } from "lodash";
import { useEffect, useMemo, useRef } from "react";
import { useDebounce } from "use-debounce";
import { useSaveCanvas } from "./use-save-canvas";

const DEBOUNCE_TIME = 3000;

export function useSaveCanvasPeriodically() {
  const { mutate: saveCanvas } = useSaveCanvas();

  const activeProblemId = useStore.use.activeProblemId();
  const activeAssignmentId = useStore.use.activeAssignmentId();
  const paths = useStore.use.paths();
  const { data: studentSolutions } =
    api.studentSolution.listStudentSolutions.useQuery(undefined, {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      retry: false,
    });

  const saveableItem = useMemo(() => {
    return {
      problemId: activeProblemId,
      studentAssignmentId: activeAssignmentId,
      canvas: {
        paths: paths,
      },
    };
  }, [activeProblemId, activeAssignmentId, paths]);

  const [debouncedSaveableItem] = useDebounce(saveableItem, DEBOUNCE_TIME, {
    maxWait: DEBOUNCE_TIME,
  });

  const lastSavedKeyRef = useRef<string>("");
  const lastSavedHashRef = useRef<string>("");
  const lastSavedAtRef = useRef<number>(0);

  useEffect(() => {
    const { problemId, studentAssignmentId, canvas } = debouncedSaveableItem;
    if (!problemId || !studentAssignmentId) return;
    if ((canvas.paths?.length ?? 0) === 0) return;

    const found = studentSolutions?.find(
      (solution) =>
        solution.problemId === problemId &&
        solution.studentAssignmentId === studentAssignmentId,
    );
    const cachedCanvasRaw = found?.canvas as unknown;
    const cachedCanvas =
      typeof cachedCanvasRaw === "string"
        ? (JSON.parse(cachedCanvasRaw) as { paths?: typeof paths })
        : (cachedCanvasRaw as { paths?: typeof paths } | undefined);

    const userHasChangedCanvas = !isEqual(
      debouncedSaveableItem.canvas,
      cachedCanvas,
    );

    const isDowngradeToEmpty =
      (canvas.paths?.length ?? 0) === 0 &&
      (cachedCanvas?.paths?.length ?? 0) > 0;

    const key = `${studentAssignmentId}:${problemId}`;
    const hash = JSON.stringify(canvas.paths ?? []);
    const now = Date.now();
    const minIntervalMs = 2500;

    const duplicatePayload =
      lastSavedKeyRef.current === key && lastSavedHashRef.current === hash;
    const tooSoon = now - lastSavedAtRef.current < minIntervalMs;

    if (
      userHasChangedCanvas &&
      !isDowngradeToEmpty &&
      !duplicatePayload &&
      !tooSoon
    ) {
      saveCanvas({
        problemId,
        studentAssignmentId,
        canvas,
      });
      lastSavedKeyRef.current = key;
      lastSavedHashRef.current = hash;
      lastSavedAtRef.current = now;
    }
  }, [debouncedSaveableItem, studentSolutions, saveCanvas]);
}
