import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export interface ProfileSlice {
  userLanguage: string | null;
  setUserLanguage: (language: string) => void;
}

export const createProfileSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  ProfileSlice
> = (set) => ({
  userLanguage: null,
  setUserLanguage: (language) =>
    set((draft) => {
      draft.userLanguage = language;
    }),
});
