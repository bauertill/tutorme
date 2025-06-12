"use client";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { type Path, type Point } from "@/store/canvas.slice";
import assert from "assert";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AnimatedScrollIcon from "./AnimatedScrollIcon";
import PointingTool from "./PointingTool";
import RestrictedScrollContainer from "./RestrictedScrollContainer";

import {
  isPointCloseToPath,
  pathToSVGPathData,
  screenToSVGCoordinates,
  toDataUrl,
} from "./utils";

const BOTTOM_PADDING = 800;
const ERASER_RADIUS = 10; // Radius for eraser collision detection

export function useCanvas() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const assertedSvg = useCallback(() => {
    assert(svgRef.current, "SVG element is not mounted");
    return svgRef.current;
  }, []);

  const paths = useStore.use.paths();
  const undoStack = useStore.use.undoStack();
  const redoStack = useStore.use.redoStack();
  const addPath = useStore.use.addPath();
  const removePathsAtIndexes = useStore.use.removePathsAtIndexes();
  const undo = useStore.use.undo();
  const redo = useStore.use.redo();
  const clear = useStore.use.clear();

  const [isUntouched_, setIsUntouched] = useState(true);
  const isUntouched =
    isUntouched_ && paths.length === 0 && undoStack.length === 0;
  const userHasScrolled = useStore.use.userHasScrolled();
  const setUserHasScrolled = useStore.use.setUserHasScrolled();

  const [currentPath, setCurrentPath] = useState<Path>();
  const currentPathRef = useRef<Path>(undefined);
  useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);
  const [erasedPaths, setErasedPaths] = useState<Path[]>([]);
  const startDrawing = useCallback(
    (point: Point) => {
      setIsUntouched(false);
      setCurrentPath([point]);
    },
    [setIsUntouched, setCurrentPath],
  );
  const addPoint = useCallback(
    (point: Point) => {
      setCurrentPath((prev) => (prev ? [...prev, point] : prev));
    },
    [setCurrentPath],
  );
  const stopDrawing = useCallback(() => {
    if (currentPathRef.current) {
      addPath(currentPathRef.current);
      setCurrentPath(undefined);
    }
  }, [addPath, setCurrentPath]);
  const [isEraser, setIsEraser] = useState(false);

  const toggleEraser = useCallback(
    (enabled?: boolean) => setIsEraser(enabled ?? !isEraser),
    [isEraser],
  );

  const eraseAtPoint = useCallback(
    (point: Point) => {
      setErasedPaths((erasedPaths) => [
        ...erasedPaths,
        ...paths.filter((path) =>
          isPointCloseToPath(point, path, ERASER_RADIUS),
        ),
      ]);
    },
    [paths],
  );

  const startErasing = useCallback(
    (point: Point) => {
      eraseAtPoint(point);
      setErasedPaths([]);
    },
    [eraseAtPoint],
  );
  const stopErasing = useCallback(() => {
    if (erasedPaths.length > 0) {
      removePathsAtIndexes(erasedPaths.map((path) => paths.indexOf(path)));
      setErasedPaths([]);
    }
  }, [removePathsAtIndexes, erasedPaths, paths]);
  const cancelErasing = useCallback(() => {
    setErasedPaths([]);
  }, [setErasedPaths]);

  const cancelDrawing = useCallback(() => {
    setCurrentPath(undefined);
  }, [setCurrentPath]);

  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const viewBox = useMemo(() => {
    const lowestPoint = paths.flat().reduce((acc, point) => {
      return Math.max(acc, point.y);
    }, 0);
    const rightestPoint = paths.flat().reduce((acc, point) => {
      return Math.max(acc, point.x);
    }, 0);
    const width = Math.max(rightestPoint, containerSize.width);
    const height = Math.max(lowestPoint + BOTTOM_PADDING, containerSize.height);
    return { x: 0, y: 0, width, height };
  }, [paths, containerSize]);

  const isScrollable = useMemo(() => {
    return viewBox.height > containerSize.height + 500;
  }, [viewBox, containerSize]);

  // Set up resize observer and prevent default events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleResize = () =>
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    const handleScroll = () => setUserHasScrolled(true);
    container.addEventListener("scroll", handleScroll);
    return () => {
      resizeObserver.disconnect();
      container.removeEventListener("scroll", handleScroll);
    };
  }, [setUserHasScrolled]);

  const pathsToDisplay = useMemo(() => {
    const pathsToDisplay = currentPath ? [...paths, currentPath] : paths;
    return pathsToDisplay.filter((path) => !erasedPaths.includes(path));
  }, [paths, currentPath, erasedPaths]);

  const transform = useCallback(
    (pos: Point) => screenToSVGCoordinates(assertedSvg(), pos.x, pos.y),
    [assertedSvg],
  );

  const svgContents = useMemo(() => {
    return pathsToDisplay.map((points, index) =>
      points.length > 1 ? (
        <PathComponent key={index} points={points} />
      ) : points.length > 0 ? (
        <circle
          key={index}
          cx={points[0]!.x}
          cy={points[0]!.y}
          r="2"
          fill="hsl(var(--accent-foreground))"
        />
      ) : null,
    );
  }, [pathsToDisplay]);

  const canvas = useMemo(
    () => (
      <div className="relative h-full w-full">
        <RestrictedScrollContainer
          ref={containerRef}
          className={cn(
            "relative h-full w-full overflow-x-auto overflow-y-scroll",
            "[scrollbar-color:hsl(var(--muted))_transparent]",
            "[scrollbar-width:thin]",
          )}
        >
          <svg
            ref={svgRef}
            className={`bg-[length:25px_25px]`}
            style={{
              backgroundImage:
                "linear-gradient(0deg, hsl(var(--muted)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--muted)) 1px, transparent 1px)",
            }}
            width={viewBox.width}
            height={viewBox.height}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          >
            {svgContents}
          </svg>
          {isEraser ? (
            <PointingTool
              className="absolute inset-0 cursor-none"
              style={{ width: viewBox.width, height: viewBox.height }}
              onStartDrawing={startErasing}
              onDraw={eraseAtPoint}
              onStopDrawing={stopErasing}
              onCancelDrawing={cancelErasing}
              transform={transform}
            >
              <div
                className={cn(
                  "rounded-full border-2 border-accent-foreground bg-background opacity-70",
                  "group-[.is-drawing]:border-destructive",
                )}
                style={{
                  width: `${ERASER_RADIUS * 2}px`,
                  height: `${ERASER_RADIUS * 2}px`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            </PointingTool>
          ) : (
            <PointingTool
              className="absolute inset-0"
              style={{ width: viewBox.width, height: viewBox.height }}
              onStartDrawing={startDrawing}
              onDraw={addPoint}
              onStopDrawing={stopDrawing}
              onCancelDrawing={cancelDrawing}
              transform={transform}
            />
          )}
        </RestrictedScrollContainer>
        {!userHasScrolled && isScrollable && (
          <div className="pointer-events-none absolute inset-0">
            <AnimatedScrollIcon className="pointer-events-none absolute bottom-4 left-20" />
          </div>
        )}
      </div>
    ),
    [
      viewBox,
      addPoint,
      startDrawing,
      stopDrawing,
      isEraser,
      eraseAtPoint,
      stopErasing,
      cancelErasing,
      startErasing,
      cancelDrawing,
      transform,
      svgContents,
      userHasScrolled,
      isScrollable,
    ],
  );

  return {
    canvas,
    undo,
    redo,
    clear,
    isEraser,
    toggleEraser,
    getDataUrl: useCallback(
      async () => await toDataUrl(assertedSvg()),
      [assertedSvg],
    ),
    canUndo: useMemo(() => undoStack.length > 0, [undoStack]),
    canRedo: useMemo(() => redoStack.length > 0, [redoStack]),
    isEmpty: useMemo(() => paths.length === 0, [paths]),
    isUntouched,
    paths,
  };
}

const PathComponent = memo(function PathComponent({
  points,
}: {
  points: Path;
}) {
  return (
    <path
      fill="none"
      stroke="hsl(var(--accent-foreground))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d={pathToSVGPathData(points)}
    />
  );
});
