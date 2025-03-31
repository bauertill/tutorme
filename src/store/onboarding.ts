import { t } from "i18next";
import { type StateCreator } from "zustand";
import type { MiddlewareList, State } from ".";

type OnboardingStepTargetCSSClass =
  | ".current-problem"
  | ".check-answer-button"
  | ".ai-explanation-section"
  | ".canvas-section";

type OnboardingStep = {
  target: OnboardingStepTargetCSSClass;
  content: string;
  title: string;
  disableBeacon?: boolean;
};

export const steps: OnboardingStep[] = [
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
