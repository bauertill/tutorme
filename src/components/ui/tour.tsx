"use client";

import { type Path } from "@/app/(main)/assignment/_components/Canvas/utils";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { steps } from "@/store/onboarding";
import { useCallback, useState } from "react";
import Joyride, { type CallBackProps, STATUS } from "react-joyride";
import { Button } from "./button";
import { Card } from "./card";

interface TourProps {
  className?: string;
}

export function Tour({ className }: TourProps) {
  const addPath = useStore.use.addPath();
  const setHasCompletedOnboarding = useStore.use.setHasCompletedOnboarding();
  const [run, setRun] = useState(true);

  const handleJoyrideCallback = useCallback(
    async (data: CallBackProps) => {
      const isCanvasStep =
        steps.map((step) => step.target).indexOf(".canvas-section") ===
        data.index;

      if (isCanvasStep && run) {
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
        setRun(false);
        if (status === STATUS.FINISHED) {
          setHasCompletedOnboarding(true);
        }
        if (status === STATUS.SKIPPED) {
          setHasCompletedOnboarding(false);
        }
      }
    },
    [addPath, setHasCompletedOnboarding, run],
  );

  return (
    <Joyride
      debug
      callback={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          arrowColor: "hsl(var(--card))",
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
                  <Button variant="ghost" {...skipProps}>
                    Skip
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {index > 0 && (
                  <Button variant="outline" {...backProps}>
                    Back
                  </Button>
                )}
                {continuous && (
                  <Button {...primaryProps}>
                    {isLastStep ? "Done" : "Next"}
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
