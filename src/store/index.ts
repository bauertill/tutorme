import {
  createSelectorFunctions,
  type ZustandFuncSelectors,
} from "auto-zustand-selectors-hook";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createAssignmentSlice, type AssignmentSlice } from "./assignment";
import { createCanvasSlice, type CanvasSlice } from "./canvas";

export type MiddlewareList = [
  ["zustand/devtools", never],
  ["zustand/persist", unknown],
  ["zustand/immer", never],
];

export type State = AssignmentSlice & CanvasSlice;

const useStoreBase = create<State>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createAssignmentSlice(...a),
        ...createCanvasSlice(...a),
      })),
      {
        name: "tutormegood-store",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  ),
);

export const useStore = createSelectorFunctions(
  useStoreBase,
) as typeof useStoreBase & ZustandFuncSelectors<State>;
