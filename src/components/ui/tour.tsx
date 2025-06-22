"use client";

import { type Path } from "@/core/canvas/canvas.types";
import { useTranslation } from "@/i18n/react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { steps } from "@/store/onboarding.slice";
import { useActiveProblem } from "@/store/problem.selectors";
import { useCallback, useEffect } from "react";
import Joyride, { type CallBackProps, STATUS } from "react-joyride";
import { Button } from "./button";
import { Card } from "./card";

interface TourProps {
  className?: string;
}

export function Tour({ className }: TourProps) {
  const { t } = useTranslation();
  const addPath = useStore.use.addPath();
  const activeProblem = useActiveProblem();
  const hasCompletedOnboarding = useStore.use.hasCompletedOnboarding();
  const setHasCompletedOnboarding = useStore.use.setHasCompletedOnboarding();
  const isTourRunning = useStore.use.isTourRunning();
  const setIsTourRunning = useStore.use.setIsTourRunning();

  useEffect(() => {
    if (!hasCompletedOnboarding) setIsTourRunning(true);
  }, [hasCompletedOnboarding, setIsTourRunning]);

  const handleJoyrideCallback = useCallback(
    async (data: CallBackProps) => {
      const isCanvasStep =
        steps.map((step) => step.target).indexOf(".canvas-section") ===
          data.index &&
        data.action === "update" &&
        data.type === "tooltip";

      // What are the chances a problem uploaded by a user starts with Ivan (50:50)
      const isExampleProblem1 = activeProblem?.problem.startsWith("Ivan");

      if (isCanvasStep && isExampleProblem1) {
        const paths = await getOnboardingSolutionPaths();
        for (const path of paths) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          addPath(path);
        }
      }

      const { status } = data;
      const finishedStatuses: (typeof STATUS)[keyof typeof STATUS][] = [
        STATUS.FINISHED,
        STATUS.SKIPPED,
      ];

      if (finishedStatuses.includes(status)) {
        setIsTourRunning(false);
        if (status === STATUS.FINISHED) {
          setHasCompletedOnboarding(true);
        }
        if (status === STATUS.SKIPPED) {
          setHasCompletedOnboarding(false);
        }
      }
    },
    [addPath, setHasCompletedOnboarding, activeProblem, setIsTourRunning],
  );

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      run={isTourRunning}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          arrowColor: "hsl(var(--border))",
          backgroundColor: "hsl(var(--card))",
          primaryColor: "hsl(var(--primary))",
          textColor: "hsl(var(--foreground))",
          zIndex: 1000,
        },
        tooltipContainer: {
          textAlign: "left",
        },
      }}
      tooltipComponent={({
        continuous,
        index,
        step,
        backProps,
        primaryProps,
        skipProps,
        isLastStep,
      }) => (
        <Card className={cn("p-4 shadow-lg", className)}>
          <div className="space-y-4">
            {step.title && (
              <h2 className="font-semibold tracking-tight">{step.title}</h2>
            )}
            <div>{step.content}</div>
            <div className="flex items-center justify-between">
              <div>
                {!isLastStep && (
                  <Button
                    variant="ghost"
                    {...skipProps}
                    onClick={(e) => {
                      setIsTourRunning(false);
                      setHasCompletedOnboarding(true);
                      skipProps.onClick(e);
                    }}
                  >
                    {t("skip")}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {index > 0 && (
                  <Button variant="outline" {...backProps}>
                    {t("back")}
                  </Button>
                )}
                {continuous && (
                  <Button {...primaryProps}>
                    {isLastStep ? t("done") : t("next")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    />
  );
}

async function getOnboardingSolutionPaths(): Promise<Path[]> {
  const paths = await fetch("/content/onboardingScribble.json");
  return (await paths.json()) as Path[];
}
