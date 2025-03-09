"use client";
import { Button } from "@/components/ui/button";
import assert from "assert";
import { Canvg } from "canvg";
import { Redo, Sparkles, Trash, Undo } from "lucide-react";
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";

const BOTTOM_PADDING = 500;

type Point = {
  x: number;
  y: number;
};

type Path = Point[];

const UNDO_HISTORY_SIZE = 1000;

type State = {
  isDrawing: boolean;
  currentPath: Path;
  paths: Path[];
  undoStack: Path[][];
  redoStack: Path[][];
};

type Action =
  | { type: "startDrawing" | "addPoint"; point: Point }
  | { type: "stopDrawing" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "clear" };

const toDataUrl = async (svgElement: SVGSVGElement): Promise<string | null> => {
  const pathElements = Array.from(svgElement.querySelectorAll("path"));
  if (pathElements.length === 0) return null;

  const p = 10;
  const bbox = svgElement.getBBox();
  const [x, y, width, height] = [
    bbox.x - p,
    bbox.y - p,
    bbox.width + p * 2,
    bbox.height + p * 2,
  ];

  // Create a new SVG element with the cropped viewBox
  const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  tempSvg.setAttribute("width", width.toString());
  tempSvg.setAttribute("height", height.toString());
  tempSvg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);

  const backgroundRect = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect",
  );
  backgroundRect.setAttribute("x", x.toString());
  backgroundRect.setAttribute("y", y.toString());
  backgroundRect.setAttribute("width", width.toString());
  backgroundRect.setAttribute("height", height.toString());
  backgroundRect.setAttribute("fill", "white");
  tempSvg.appendChild(backgroundRect);

  // Clone and append all path elements
  pathElements.forEach((path) => {
    const clone = path.cloneNode(true);
    const stroke = (clone as SVGElement).getAttribute("stroke");
    if (stroke) {
      (clone as SVGElement).setAttribute("stroke", "black");
    }
    tempSvg.appendChild(clone);
  });

  // Create a canvas element to draw on
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  assert(ctx, "Canvas context is not mounted");

  // Render the cropped SVG
  const v = await Canvg.from(ctx, tempSvg.outerHTML);
  await v.render();

  const url = canvas.toDataURL("image/webp");
  return url;
};

const pathToSVGPathData = (path: Path) => {
  let pathData = "";

  const firstPoint = path[0];
  if (!firstPoint) return;
  pathData += `M${firstPoint.x},${firstPoint.y}`;

  // Use a curve fitting algorithm instead of straight lines
  if (path.length > 2) {
    // For each point (except first and last), create a smooth curve
    for (let i = 1; i < path.length - 1; i++) {
      const point = path[i];
      const nextPoint = path[i + 1];

      if (point && nextPoint) {
        // Use quadratic Bézier curve (Q) for smoother lines
        // Control point is the current point, and we go to the midpoint between current and next
        const midX = (point.x + nextPoint.x) / 2;
        const midY = (point.y + nextPoint.y) / 2;

        pathData += ` Q${point.x},${point.y} ${midX},${midY}`;
      }
    }

    // Add the last point with a line
    const lastPoint = path[path.length - 1];
    if (lastPoint) {
      pathData += ` L${lastPoint.x},${lastPoint.y}`;
    }
  } else {
    // If we have only 2 points or fewer, use simple lines
    for (let i = 1; i < path.length; i++) {
      const point = path[i];
      if (point) {
        pathData += ` L${point.x},${point.y}`;
      }
    }
  }
  return pathData;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "startDrawing": {
      if (state.isDrawing) return state;
      return { ...state, currentPath: [action.point], isDrawing: true };
    }
    case "addPoint": {
      if (!state.isDrawing) return state;
      return { ...state, currentPath: [...state.currentPath, action.point] };
    }
    case "stopDrawing": {
      if (!state.isDrawing) return state;
      return {
        ...state,
        isDrawing: false,
        paths: [...state.paths, state.currentPath],
        undoStack: [...state.undoStack, state.paths].slice(-UNDO_HISTORY_SIZE),
        redoStack: [],
        currentPath: [],
      };
    }
    case "undo": {
      if (state.isDrawing) return state;
      const paths = state.undoStack.at(-1);
      if (!paths) return state;
      return {
        ...state,
        paths,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.paths],
      };
    }
    case "redo": {
      if (state.isDrawing) return state;
      const paths = state.redoStack.at(-1);
      if (!paths) return state;
      return {
        ...state,
        paths,
        undoStack: [...state.undoStack, state.paths],
        redoStack: state.redoStack.slice(0, -1),
      };
    }
    case "clear": {
      if (state.isDrawing) return state;
      if (state.paths.length === 0) return state;
      return {
        ...state,
        isDrawing: false,
        paths: [],
        undoStack: [...state.undoStack, state.paths].slice(-UNDO_HISTORY_SIZE),
        redoStack: [],
        currentPath: [],
      };
    }
  }
};

const screenToSVGCoordinates = (
  svg: SVGSVGElement,
  screenX: number,
  screenY: number,
): Point => {
  const svgPoint = svg.createSVGPoint();
  svgPoint.x = screenX;
  svgPoint.y = screenY;

  // Get the current transformation matrix and invert it
  const CTM = svg.getScreenCTM();
  if (!CTM) return { x: 0, y: 0 };

  const invertedCTM = CTM.inverse();
  const transformedPoint = svgPoint.matrixTransform(invertedCTM);

  return {
    x: transformedPoint.x,
    y: transformedPoint.y,
  };
};

const preventDefaults = (svg: SVGSVGElement) => {
  svg.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 1) e.preventDefault();
    },
    { passive: false },
  );
  svg.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length === 1) e.preventDefault();
    },
    { passive: false },
  );

  return svg;
};

export function useSVGCanvas() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const assertedSvg = () => {
    assert(svgRef.current, "SVG element is not mounted");
    return svgRef.current;
  };
  const [{ currentPath, paths, undoStack, redoStack }, dispatch] = useReducer(
    reducer,
    {
      isDrawing: false,
      currentPath: [],
      paths: [],
      undoStack: [],
      redoStack: [],
    },
  );
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const lowestPoint = useMemo(() => {
    return paths.flat().reduce((acc, point) => {
      return Math.max(acc, point.y);
    }, 0);
  }, [paths]);
  const rightestPoint = useMemo(() => {
    return paths.flat().reduce((acc, point) => {
      return Math.max(acc, point.x);
    }, 0);
  }, [paths]);
  const [viewBox, setViewBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({ x: 0, y: 0, width: 0, height: 0 });
  useEffect(() => {
    const width = Math.max(rightestPoint, containerSize.width);
    const height = Math.max(lowestPoint + BOTTOM_PADDING, containerSize.height);
    setViewBox({ x: 0, y: 0, width, height });
    const container = containerRef.current;
    setTimeout(() => {
      if (
        container?.clientWidth !== containerSize.width ||
        container?.clientHeight !== containerSize.height
      ) {
        setContainerSize({
          width: container?.clientWidth ?? 0,
          height: container?.clientHeight ?? 0,
        });
      }
    }, 0);
  }, [lowestPoint, rightestPoint, containerSize, setViewBox]);

  // Initialize the viewBox and handle resize
  useEffect(() => {
    const svg = assertedSvg();
    preventDefaults(svg);
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    // Set initial viewBox
    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // window.addEventListener("resize", handleWindowResize);

    return () => {
      // window.removeEventListener("resize", handleWindowResize);
      resizeObserver.disconnect();
    };
  }, []);

  // Convert the event handlers to accept React event types
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Only start drawing with left mouse button
    if (e.button !== 0) return;

    const point = screenToSVGCoordinates(assertedSvg(), e.clientX, e.clientY);
    dispatch({ type: "startDrawing", point });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    // Only start drawing with left mouse button
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
    // Only handle single touch for drawing
    // Let browser handle multi-touch events
    if (e.touches.length !== 1) return;
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
    // Only handle single touch for drawing
    // Let browser handle multi-touch events
    if (e.touches.length !== 1) return;

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

  const svg = (
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
  );

  const container = (
    <div ref={containerRef} className="relative h-full w-full overflow-auto">
      {svg}
    </div>
  );

  return {
    svgCanvas: container,
    undo: () => dispatch({ type: "undo" }),
    redo: () => dispatch({ type: "redo" }),
    clear: () => dispatch({ type: "clear" }),
    getDataUrl: async () => await toDataUrl(assertedSvg()),
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    isEmpty: paths.length === 0,
  };
}

export function SVGCanvasWithControls({
  onCheck,
}: {
  onCheck: (dataUrl: string) => void;
}) {
  const {
    svgCanvas,
    undo,
    redo,
    clear,
    getDataUrl,
    canUndo,
    canRedo,
    isEmpty,
  } = useSVGCanvas();
  return (
    <div className="relative h-full w-full overflow-hidden">
      {svgCanvas}

      <div className="absolute right-4 top-4 z-10 flex space-x-2">
        {!isEmpty && (
          <Button variant="outline" onClick={clear}>
            <Trash className="h-4 w-4" />
          </Button>
        )}
        <Button variant="outline" onClick={undo} disabled={!canUndo}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={redo} disabled={!canRedo}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      {!isEmpty && (
        <div className="absolute bottom-4 right-4 z-10 flex space-x-2">
          <Button
            onClick={async () => {
              const dataUrl = await getDataUrl();
              if (!dataUrl) return;
              onCheck(dataUrl);
            }}
          >
            <Sparkles className="h-4 w-4" />
            Check
          </Button>
        </div>
      )}
    </div>
  );
}
