"use client";

import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import Joyride, { type CallBackProps, STATUS, type Step } from "react-joyride";
import { Button } from "./button";
import { Card } from "./card";

interface TourProps {
  steps: Step[];
  className?: string;
  onFinish?: () => void;
  onSkip?: () => void;
}

export function Tour({ steps, className, onFinish, onSkip }: TourProps) {
  const [run, setRun] = useState(true);

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status } = data;
      const finishedStatuses: (typeof STATUS)[keyof typeof STATUS][] = [
        STATUS.FINISHED,
        STATUS.SKIPPED,
      ];

      if (finishedStatuses.includes(status)) {
        setRun(false);
        if (status === STATUS.FINISHED && onFinish) {
          onFinish();
        }
        if (status === STATUS.SKIPPED && onSkip) {
          onSkip();
        }
      }
    },
    [onFinish, onSkip],
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
              {!isLastStep && (
                <Button variant="ghost" {...skipProps}>
                  Skip
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    />
  );
}
