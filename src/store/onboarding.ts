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
    target: ".check-answer-button",
    content: t("onboarding.checkAnswerButton"),
    title: t("onboarding.checkAnswerButtonTitle"),
  },
];

export interface OnboardingSlice {
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
}

export const createOnboardingSlice: StateCreator<
  State,
  MiddlewareList,
  [],
  OnboardingSlice
> = (set) => ({
  hasCompletedOnboarding: false,
  setHasCompletedOnboarding: (completed) =>
    set((draft) => {
      draft.hasCompletedOnboarding = completed;
    }),
});
