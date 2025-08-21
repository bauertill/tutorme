import { type Canvas } from "@/core/canvas/canvas.types";
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
      canvas: {
        paths: paths,
      },
    };
  }, [activeProblemId, paths]);

  const [debouncedSaveableItem] = useDebounce(saveableItem, DEBOUNCE_TIME, {
    maxWait: DEBOUNCE_TIME,
  });

  const lastSavedKeyRef = useRef<string>("");
  const lastSavedHashRef = useRef<string>("");
  const lastSavedAtRef = useRef<number>(0);

  useEffect(() => {
    const { problemId, canvas } = debouncedSaveableItem;
    if (!problemId || !canvas.paths?.length) return;

    const studentSolution = studentSolutions?.find(
      (s) => s.problemId === problemId,
    );
    if (!studentSolution) return;

    const cachedCanvas = parseCanvasData(studentSolution.canvas);
    const hasChanges = !isEqual(canvas, cachedCanvas);
    const shouldSave =
      hasChanges &&
      !isDuplicateOrTooSoon(
        problemId,
        canvas,
        lastSavedKeyRef,
        lastSavedHashRef,
        lastSavedAtRef,
      );

    if (shouldSave) {
      saveCanvas({
        problemId,
        studentSolutionId: studentSolution.id,
        canvas,
      });
      updateSaveTracking(
        problemId,
        canvas,
        lastSavedKeyRef,
        lastSavedHashRef,
        lastSavedAtRef,
      );
    }
  }, [debouncedSaveableItem, studentSolutions, saveCanvas]);
}

function parseCanvasData(canvasRaw: unknown): Canvas {
  if (typeof canvasRaw === "string") {
    return JSON.parse(canvasRaw) as Canvas;
  }
  return canvasRaw as Canvas;
}

function isDuplicateOrTooSoon(
  problemId: string,
  canvas: Canvas,
  lastSavedKeyRef: React.MutableRefObject<string>,
  lastSavedHashRef: React.MutableRefObject<string>,
  lastSavedAtRef: React.MutableRefObject<number>,
): boolean {
  const key = problemId;
  const hash = JSON.stringify(canvas.paths ?? []);
  const now = Date.now();
  const minIntervalMs = 2500;

  const duplicatePayload =
    lastSavedKeyRef.current === key && lastSavedHashRef.current === hash;
  const tooSoon = now - lastSavedAtRef.current < minIntervalMs;

  return duplicatePayload || tooSoon;
}

function updateSaveTracking(
  problemId: string,
  canvas: Canvas,
  lastSavedKeyRef: React.MutableRefObject<string>,
  lastSavedHashRef: React.MutableRefObject<string>,
  lastSavedAtRef: React.MutableRefObject<number>,
): void {
  lastSavedKeyRef.current = problemId;
  lastSavedHashRef.current = JSON.stringify(canvas.paths ?? []);
  lastSavedAtRef.current = Date.now();
}
