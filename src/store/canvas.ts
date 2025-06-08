import { type Canvas } from "@/core/canvas/types";
import { type StateCreator } from "zustand";
import { type MiddlewareList, type State } from ".";

export type Point = {
  x: number;
  y: number;
};

export type Path = Point[];
export interface CanvasSlice {
  isDrawing: boolean;
  paths: Path[];
  undoStack: Path[][];
  redoStack: Path[][];

  // Canvas actions
  addPath: (path: Path) => void;
  removePathsAtIndexes: (indexes: number[]) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;

  // Problem management
  setCanvas: (canvas: Canvas) => void;
}

const UNDO_HISTORY_SIZE = 100;

export const createCanvasSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  CanvasSlice
> = (set) => ({
  // Initial state
  isDrawing: false,
  paths: [],
  undoStack: [],
  redoStack: [],

  addPath: (path: Path) =>
    set((state: CanvasSlice) => {
      return {
        paths: [...state.paths, path],
        undoStack: [...state.undoStack, state.paths].slice(-UNDO_HISTORY_SIZE),
        redoStack: [],
      };
    }),

  removePathsAtIndexes: (indexes: number[]) =>
    set((state: CanvasSlice) => {
      return {
        paths: state.paths.filter((_, i) => !indexes.includes(i)),
        undoStack: [...state.undoStack, state.paths].slice(-UNDO_HISTORY_SIZE),
        redoStack: [],
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

  setCanvas: (canvas: Canvas) =>
    set(() => {
      return {
        paths: canvas.paths,
        undoStack: [],
        redoStack: [],
        isDrawing: false,
      };
    }),
});
