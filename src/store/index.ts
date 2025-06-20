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
import { createCanvasSlice, type CanvasSlice } from "./canvas.slice";
import {
  createOnboardingSlice,
  type OnboardingSlice,
} from "./onboarding.slice";
import { createProblemSlice, type ProblemSlice } from "./problem.slice";
import { createProfileSlice, type ProfileSlice } from "./profile.slice";
import {
  createUsageLimitSlice,
  type UsageLimitSlice,
} from "./usageLimit.slice";

export type MiddlewareList = [
  ["zustand/devtools", never],
  ["zustand/persist", unknown],
  ["zustand/immer", never],
];

export type State = ProblemSlice &
  CanvasSlice &
  UsageLimitSlice &
  ProfileSlice &
  OnboardingSlice;

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
        ...createProblemSlice(...a),
        ...createCanvasSlice(...a),
        ...createUsageLimitSlice(...a),
        ...createProfileSlice(...a),
        ...createOnboardingSlice(...a),
      })),
      {
        name: "tutormegood-store",
        storage,
        version: 3,
      },
    ),
  ),
);

export const useStore = createSelectorFunctions(
  useStoreBase,
) as typeof useStoreBase & ZustandFuncSelectors<State>;
