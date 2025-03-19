"use client";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { type Path, type Point } from "@/store/canvas";
import assert from "assert";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  isPointCloseToPath,
  pathToSVGPathData,
  preventDefaults,
  screenToSVGCoordinates,
  toDataUrl,
} from "./utils";

const BOTTOM_PADDING = 800;
const ERASER_RADIUS = 10; // Radius for eraser collision detection

export function useCanvas() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const eraserRef = useRef<HTMLDivElement | null>(null);
  const assertedSvg = () => {
    assert(svgRef.current, "SVG element is not mounted");
    return svgRef.current;
  };

  const paths = useStore.use.paths();
  const undoStack = useStore.use.undoStack();
  const redoStack = useStore.use.redoStack();
  const addPath = useStore.use.addPath();
  const removePathsAtIndexes = useStore.use.removePathsAtIndexes();
  const undo = useStore.use.undo();
  const redo = useStore.use.redo();
  const clear = useStore.use.clear();

  const [currentPath, setCurrentPath] = useState<Path>();
  const [erasedPaths, setErasedPaths] = useState<Path[]>([]);
  const startDrawing = (point: Point) => setCurrentPath([point]);
  const addPoint = (point: Point) => {
    if (currentPath) setCurrentPath([...currentPath, point]);
  };
  const stopDrawing = () => {
    if (currentPath) {
      addPath(currentPath);
      setCurrentPath(undefined);
    }
  };
  const startErasing = (point: Point) => {
    setIsEraserActive(true);
    handleEraseAtPoint(point);
    setErasedPaths([]);
  };
  const stopErasing = () => {
    if (isEraserActive) {
      setIsEraserActive(false);
      removePathsAtIndexes(erasedPaths.map((path) => paths.indexOf(path)));
      setErasedPaths([]);
    }
  };
  const cancelDrawing = () => {
    if (currentPath) setCurrentPath(undefined);
  };
  const [isEraser, setIsEraser] = useState(false);
  const toggleEraser = () => setIsEraser(!isEraser);
  const eraseAtPoint = (point: Point, radius: number) => {
    setErasedPaths((erasedPaths) => [
      ...erasedPaths,
      ...paths.filter((path) => isPointCloseToPath(point, path, radius)),
    ]);
  };

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isEraserActive, setIsEraserActive] = useState(false);

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

  const [multiTouchInfo, setMultiTouchInfo] = useState<{
    lastY: number;
    delta: number;
  }>({ lastY: 0, delta: 0 });

  // Set up resize observer and prevent default events
  useEffect(() => {
    preventDefaults(assertedSvg());
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
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Scroll the container when user uses multi-touch
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = Math.min(
        container.scrollTop - multiTouchInfo.delta,
        container.scrollHeight - container.clientHeight,
      );
    }
  }, [multiTouchInfo]);

  // Update eraser cursor position
  useEffect(() => {
    if (!isEraser || !eraserRef.current) return;

    const updateEraserPosition = (e: MouseEvent) => {
      if (eraserRef.current) {
        eraserRef.current.style.left = `${e.clientX}px`;
        eraserRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener("mousemove", updateEraserPosition);

    return () => {
      window.removeEventListener("mousemove", updateEraserPosition);
    };
  }, [isEraser]);

  // Function to handle erasing at a specific point
  const handleEraseAtPoint = (point: { x: number; y: number }) => {
    if (isEraserActive) {
      eraseAtPoint(point, ERASER_RADIUS);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Only start drawing with left mouse button
    if (e.button !== 0) return;
    const point = screenToSVGCoordinates(assertedSvg(), e.clientX, e.clientY);
    setMousePosition({ x: e.clientX, y: e.clientY });

    if (isEraser) {
      // Start erasing
      startErasing(point);
    } else {
      // Normal drawing
      startDrawing(point);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const point = screenToSVGCoordinates(assertedSvg(), e.clientX, e.clientY);
    setMousePosition({ x: e.clientX, y: e.clientY });

    if (isEraser) {
      // Only erase if mouse button is pressed
      handleEraseAtPoint(point);
    } else if (e.buttons === 1) {
      // Normal drawing - only if left mouse button is pressed
      addPoint(point);
    }
  };

  const handleMouseLeave = () => {
    if (isEraser) {
      stopErasing();
    } else {
      stopDrawing();
    }
  };

  const handleMouseUp = () => {
    if (isEraser) {
      stopErasing();
    } else {
      stopDrawing();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length > 1) {
      cancelDrawing();
      setMultiTouchInfo({ lastY: e.touches[0]?.clientY ?? 0, delta: 0 });
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    const point = screenToSVGCoordinates(
      assertedSvg(),
      touch.clientX,
      touch.clientY,
    );
    setMousePosition({ x: touch.clientX, y: touch.clientY });

    if (isEraser) {
      // Start erasing
      startErasing(point);
    } else {
      // Normal drawing
      startDrawing(point);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length > 1) {
      cancelDrawing();
      const touch = e.touches[0];
      if (touch) {
        setMultiTouchInfo((prev) => ({
          lastY: touch.clientY,
          delta: touch.clientY - prev.lastY,
        }));
      }
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    const point = screenToSVGCoordinates(
      assertedSvg(),
      touch.clientX,
      touch.clientY,
    );
    setMousePosition({ x: touch.clientX, y: touch.clientY });

    if (isEraser) {
      // Only erase if touch is active
      handleEraseAtPoint(point);
    } else {
      // Normal drawing
      addPoint(point);
    }
  };

  const handleTouchEnd = () => {
    if (isEraser) {
      stopErasing();
    } else {
      stopDrawing();
    }
  };

  // Define cursor style based on mode
  const cursorStyle = isEraser ? "cursor-none" : "cursor-pencil";

  const pathsToDisplay = useMemo(() => {
    const pathsToDisplay = currentPath ? [...paths, currentPath] : paths;
    return pathsToDisplay.filter((path) => !erasedPaths.includes(path));
  }, [paths, currentPath, erasedPaths]);

  const canvas = (
    <div
      ref={containerRef}
      className="group relative h-full w-full overflow-auto"
    >
      {isEraser && (
        <div
          ref={eraserRef}
          className={cn(
            "pointer-events-none fixed z-50 rounded-full border-2 border-accent-foreground bg-background opacity-70",
            "hidden group-hover:block",
            isEraserActive && "border-destructive",
          )}
          style={{
            width: `${ERASER_RADIUS * 2}px`,
            height: `${ERASER_RADIUS * 2}px`,
            transform: "translate(-50%, -50%)",
            left: mousePosition.x,
            top: mousePosition.y,
          }}
        />
      )}
      <svg
        ref={svgRef}
        className={`absolute inset-0 bg-[length:25px_25px] ${cursorStyle}`}
        style={{
          backgroundImage:
            "linear-gradient(0deg, hsl(var(--muted)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--muted)) 1px, transparent 1px)",
        }}
        width={viewBox.width}
        height={viewBox.height}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {pathsToDisplay.map((points, index) =>
          points.length > 1 ? (
            <path
              key={index}
              fill="none"
              stroke="hsl(var(--accent-foreground))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d={pathToSVGPathData(points)}
            />
          ) : points.length > 0 ? (
            <circle
              key={index}
              cx={points[0]!.x}
              cy={points[0]!.y}
              r="2"
              fill="hsl(var(--accent-foreground))"
            />
          ) : null,
        )}
      </svg>
    </div>
  );

  return {
    canvas,
    undo,
    redo,
    clear,
    isEraser,
    toggleEraser,
    getDataUrl: async () => await toDataUrl(assertedSvg()),
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    isEmpty: paths.length === 0,
  };
}
