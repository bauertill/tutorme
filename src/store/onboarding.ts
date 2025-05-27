import { t } from "i18next";
import type { Props as JoyrideProps } from "react-joyride";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

export const steps: JoyrideProps["steps"] = [
  {
    disableBeacon: true,
    target: ".current-problem",
    content: t("onboarding.currentProblem"),
    title: t("onboarding.currentProblemTitle"),
  },
  {
    target: ".canvas-section",
    content: t("onboarding.canvasSection"),
    title: t("onboarding.canvasSectionTitle"),
    placement: "top-start",
    spotlightPadding: 0,
    offset: -40,
  },
  {
    target: ".get-help-section",
    content: t("onboarding.getHelpSection"),
    title: t("onboarding.getHelpSectionTitle"),
    placement: "left-start",
  },
  {
    target: ".check-answer-button",
    content: t("onboarding.checkAnswerButton"),
    title: t("onboarding.checkAnswerButtonTitle"),
    placement: "left-start",
  },
];

export interface OnboardingSlice {
  isTourRunning: boolean;
  setIsTourRunning: (running: boolean) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
  userHasScrolled: boolean;
  setUserHasScrolled: (shown: boolean) => void;
}

export const createOnboardingSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  OnboardingSlice
> = (set) => ({
  isTourRunning: false,
  setIsTourRunning: (running) =>
    set((draft) => {
      draft.isTourRunning = running;
    }),
  hasCompletedOnboarding: false,
  setHasCompletedOnboarding: (completed) =>
    set((draft) => {
      draft.hasCompletedOnboarding = completed;
    }),
  userHasScrolled: false,
  setUserHasScrolled: (shown) =>
    set((draft) => {
      draft.userHasScrolled = shown;
    }),
});
