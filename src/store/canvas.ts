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
  currentPath: Path;
  paths: Path[];
  undoStack: Path[][];
  redoStack: Path[][];

  // Canvas actions
  startDrawing: (point: Point) => void;
  addPoint: (point: Point) => void;
  stopDrawing: () => void;
  cancelDrawing: () => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;

  // Problem management
  setCanvas: (canvas: Canvas) => void;
}

const UNDO_HISTORY_SIZE = 1000;

export const createCanvasSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  CanvasSlice
> = (set) => ({
  // Initial state
  isDrawing: false,
  currentPath: [],
  paths: [],
  undoStack: [],
  redoStack: [],

  // Drawing actions
  startDrawing: (point: Point) =>
    set(() => ({
      currentPath: [point],
      isDrawing: true,
    })),

  addPoint: (point: Point) =>
    set((state: CanvasSlice) => {
      if (!state.isDrawing) return state;
      return {
        currentPath: [...state.currentPath, point],
      };
    }),

  stopDrawing: () =>
    set((state: CanvasSlice) => {
      if (!state.isDrawing) return state;
      return {
        isDrawing: false,
        paths: [...state.paths, state.currentPath],
        undoStack: [...state.undoStack, state.paths].slice(-UNDO_HISTORY_SIZE),
        redoStack: [],
        currentPath: [],
      };
    }),

  cancelDrawing: () =>
    set((state: CanvasSlice) => {
      if (!state.isDrawing) return state;
      return {
        isDrawing: false,
        currentPath: [],
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
        currentPath: [],
      };
    }),

  setCanvas: (canvas: Canvas) =>
    set(() => {
      return {
        paths: canvas.paths,
        undoStack: [],
        redoStack: [],
        currentPath: [],
        isDrawing: false,
      };
    }),
});
