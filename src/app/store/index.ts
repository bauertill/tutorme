import {
  createSelectorFunctions,
  type ZustandFuncSelectors,
} from "auto-zustand-selectors-hook";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createProblemSlice, type ProblemSlice } from "./problem";

export type MiddlewareList = [
  ["zustand/devtools", never],
  ["zustand/persist", unknown],
  ["zustand/immer", never],
];

export type State = ProblemSlice;

const useStoreBase = create<State>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createProblemSlice(...a),
      })),
      {
        name: "code-storage",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  ),
);

export const useStore = createSelectorFunctions(
  useStoreBase,
) as typeof useStoreBase & ZustandFuncSelectors<State>;
