import {
  createSelectorFunctions,
  type ZustandFuncSelectors,
} from "auto-zustand-selectors-hook";
import superjson from "superjson";
import { create } from "zustand";
import { devtools, persist, type PersistStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createAssignmentSlice, type AssignmentSlice } from "./assignment";
import { createCanvasSlice, type CanvasSlice } from "./canvas";

export type MiddlewareList = [
  ["zustand/devtools", never],
  ["zustand/persist", unknown],
  ["zustand/immer", never],
];

export type State = AssignmentSlice & CanvasSlice;

const storage: PersistStorage<State> = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    return superjson.parse(str);
  },
  setItem: async (name, value) => {
    localStorage.setItem(name, superjson.stringify(value));
  },
  removeItem: (name) => localStorage.removeItem(name),
};

const useStoreBase = create<State>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createAssignmentSlice(...a),
        ...createCanvasSlice(...a),
      })),
      {
        name: "tutormegood-store",
        storage,
      },
    ),
  ),
);

export const useStore = createSelectorFunctions(
  useStoreBase,
) as typeof useStoreBase & ZustandFuncSelectors<State>;
