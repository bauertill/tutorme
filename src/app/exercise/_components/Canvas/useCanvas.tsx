"use client";
import assert from "assert";
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { initialState, reducer } from "./state";
import {
  pathToSVGPathData,
  preventDefaults,
  screenToSVGCoordinates,
  toDataUrl,
} from "./utils";

const BOTTOM_PADDING = 500;

export function useCanvas() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const assertedSvg = () => {
    assert(svgRef.current, "SVG element is not mounted");
    return svgRef.current;
  };
  const [{ currentPath, paths, undoStack, redoStack }, dispatch] = useReducer(
    reducer,
    initialState,
  );
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

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Only start drawing with left mouse button
    if (e.button !== 0) return;
    const point = screenToSVGCoordinates(assertedSvg(), e.clientX, e.clientY);
    dispatch({ type: "startDrawing", point });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    // Only draw with left mouse button
    if (e.button !== 0) return;
    const point = screenToSVGCoordinates(assertedSvg(), e.clientX, e.clientY);
    dispatch({ type: "addPoint", point });
  };

  const handleMouseLeave = () => {
    dispatch({ type: "stopDrawing" });
  };

  const handleMouseUp = () => {
    dispatch({ type: "stopDrawing" });
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length > 1) {
      dispatch({ type: "cancelDrawing" });
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
    dispatch({ type: "startDrawing", point });
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length > 1) {
      dispatch({ type: "cancelDrawing" });
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
    dispatch({ type: "addPoint", point });
  };

  const handleTouchEnd = () => {
    dispatch({ type: "stopDrawing" });
  };

  const canvas = (
    <div ref={containerRef} className="relative h-full w-full overflow-auto">
      <svg
        ref={svgRef}
        className="absolute inset-0 bg-[length:20px_20px]"
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
        {[...paths, currentPath].map((points, index) =>
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
    undo: () => dispatch({ type: "undo" }),
    redo: () => dispatch({ type: "redo" }),
    clear: () => dispatch({ type: "clear" }),
    getDataUrl: async () => await toDataUrl(assertedSvg()),
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    isEmpty: paths.length === 0,
  };
}
