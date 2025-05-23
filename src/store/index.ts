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
import { createHelpSlice, type HelpSlice } from "./help";
import { createOnboardingSlice, type OnboardingSlice } from "./onboarding";
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
  ProfileSlice &
  HelpSlice &
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
        ...createAssignmentSlice(...a),
        ...createCanvasSlice(...a),
        ...createUsageLimitSlice(...a),
        ...createProfileSlice(...a),
        ...createHelpSlice(...a),
        ...createOnboardingSlice(...a),
      })),
      {
        name: "tutormegood-store",
        storage,
        version: 1,
      },
    ),
  ),
);

export const useStore = createSelectorFunctions(
  useStoreBase,
) as typeof useStoreBase & ZustandFuncSelectors<State>;
