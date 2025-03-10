import { type Path, type Point } from "./utils";

const UNDO_HISTORY_SIZE = 1000;

export type State = {
  isDrawing: boolean;
  currentPath: Path;
  paths: Path[];
  undoStack: Path[][];
  redoStack: Path[][];
};

export const initialState: State = {
  isDrawing: false,
  currentPath: [],
  paths: [],
  undoStack: [],
  redoStack: [],
};

export type Action =
  | { type: "startDrawing" | "addPoint"; point: Point }
  | { type: "stopDrawing" }
  | { type: "cancelDrawing" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "clear" };

export const reducer = (state: State, action: Action): State => {
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
    case "cancelDrawing": {
      if (!state.isDrawing) return state;
      return {
        ...state,
        isDrawing: false,
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
