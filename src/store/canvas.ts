import { type Canvas } from "@/core/assignment/types";
import { type StateCreator } from "zustand";
import { type MiddlewareList, type State } from ".";

export type Point = {
  x: number;
  y: number;
};

export type Path = Point[];
export interface CanvasSlice {
  isDrawing: boolean;
  isEraser: boolean;
  paths: Path[];
  undoStack: Path[][];
  redoStack: Path[][];

  // Canvas actions
  addPath: (path: Path) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  toggleEraser: () => void;
  eraseAtPoint: (point: Point, radius: number) => void;

  // Problem management
  setCanvas: (canvas: Canvas) => void;
}

const UNDO_HISTORY_SIZE = 1000;

// Helper function to calculate distance between two points
const distance = (p1: Point, p2: Point): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Helper function to check if a point is close to a path
const isPointCloseToPath = (
  point: Point,
  path: Path,
  radius: number,
): boolean => {
  if (path.length < 2) return false;

  // Check if point is close to any segment of the path
  for (let i = 1; i < path.length; i++) {
    const p1 = path[i - 1];
    const p2 = path[i];

    // Skip if either point is undefined (shouldn't happen, but to satisfy TypeScript)
    if (!p1 || !p2) continue;

    // Calculate distance from point to line segment
    const len = distance(p1, p2);
    if (len === 0) continue;

    // Calculate projection of point onto line segment
    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - p1.x) * (p2.x - p1.x) + (point.y - p1.y) * (p2.y - p1.y)) /
          (len * len),
      ),
    );

    const proj = {
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y),
    };

    // Check if distance from point to projection is less than radius
    if (distance(point, proj) <= radius) {
      return true;
    }
  }

  return false;
};

export const createCanvasSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  CanvasSlice
> = (set) => ({
  // Initial state
  isDrawing: false,
  isEraser: false,
  paths: [],
  undoStack: [],
  redoStack: [],

  addPath: (path: Path) =>
    set((state: CanvasSlice) => {
      return {
        paths: [...state.paths, path],
      };
    }),

  undo: () =>
    set((state: CanvasSlice) => {
      if (state.isDrawing) return state;
      const paths = state.undoStack.at(-1);
      if (!paths) return state;
      return {
        paths,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.paths],
      };
    }),

  redo: () =>
    set((state: CanvasSlice) => {
      if (state.isDrawing) return state;
      const paths = state.redoStack.at(-1);
      if (!paths) return state;
      return {
        paths,
        undoStack: [...state.undoStack, state.paths],
        redoStack: state.redoStack.slice(0, -1),
      };
    }),

  clear: () =>
    set((state: CanvasSlice) => {
      if (state.isDrawing) return state;
      if (state.paths.length === 0) return state;
      return {
        isDrawing: false,
        paths: [],
        undoStack: [...state.undoStack, state.paths].slice(-UNDO_HISTORY_SIZE),
        redoStack: [],
      };
    }),

  toggleEraser: () =>
    set((state: CanvasSlice) => ({
      isEraser: !state.isEraser,
    })),

  eraseAtPoint: (point: Point, radius: number) =>
    set((state: CanvasSlice) => {
      if (state.paths.length === 0) return state;

      // Save current state for undo
      const oldPaths = [...state.paths];

      // Filter out paths that intersect with the eraser
      const newPaths = state.paths.filter(
        (path) => !isPointCloseToPath(point, path, radius),
      );

      // If no paths were erased, return the current state
      if (newPaths.length === oldPaths.length) return state;

      return {
        paths: newPaths,
        undoStack: [...state.undoStack, oldPaths].slice(-UNDO_HISTORY_SIZE),
        redoStack: [],
      };
    }),

  setCanvas: (canvas: Canvas) =>
    set(() => {
      return {
        paths: canvas.paths,
        undoStack: [],
        redoStack: [],
        isDrawing: false,
        isEraser: false,
      };
    }),
});
