import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface UsageLimitSlice {
  isUsageLimitReached: boolean;
  setUsageLimitReached: (reached: boolean) => void;
}

export const createUsageLimitSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  UsageLimitSlice
> = (set) => ({
  isUsageLimitReached: false,
  setUsageLimitReached: (reached) =>
    set((draft) => {
      draft.isUsageLimitReached = reached;
    }),
});
