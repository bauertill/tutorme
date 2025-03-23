import {
  createSelectorFunctions,
  type ZustandFuncSelectors,
} from "auto-zustand-selectors-hook";
import { del, get, set } from "idb-keyval";
import { omit } from "lodash";
import superjson from "superjson";
import { create } from "zustand";
import { devtools, persist, type PersistStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createAssignmentSlice, type AssignmentSlice } from "./assignment";
import { createCanvasSlice, type CanvasSlice } from "./canvas";
import { createProfileSlice, type ProfileSlice } from "./profile";
import { createUsageLimitSlice, type UsageLimitSlice } from "./usageLimit";

export type MiddlewareList = [
  ["zustand/devtools", never],
  ["zustand/persist", unknown],
  ["zustand/immer", never],
];

export type State = AssignmentSlice &
  CanvasSlice &
  UsageLimitSlice &
  ProfileSlice;

const storage: PersistStorage<State> = {
  getItem: async (name) => {
    const str = await get<string>(name);
    if (!str) return null;
    return superjson.parse(str);
  },
  setItem: async (name, value) => {
    const value_ = {
      ...value,
      state: omit(value.state, ["undoStack", "redoStack"]),
    };
    await set(name, superjson.stringify(value_));
  },
  removeItem: async (name) => {
    await del(name);
  },
};

const useStoreBase = create<State>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createAssignmentSlice(...a),
        ...createCanvasSlice(...a),
        ...createUsageLimitSlice(...a),
        ...createProfileSlice(...a),
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
