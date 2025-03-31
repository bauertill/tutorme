"use client";
import { useTrackEvent } from "@/app/_components/GoogleTagManager";
import { Button } from "@/components/ui/button";
import { type Message } from "@/core/help/types";
import { Trans, useTranslation } from "@/i18n/react";
import { useStore } from "@/store";
import {
  useActiveProblem,
  useEvaluationResult,
  useHelp,
} from "@/store/selectors";
import { api } from "@/trpc/react";
import {
  Eraser,
  Loader2,
  Pencil,
  Redo,
  Sparkles,
  Trash,
  Undo,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CelebrationDialog } from "./CelebrationDialog";
import HelpButton from "./HelpButton";
import { useCanvas } from "./useCanvas";
import WritingAnimation from "./WritingAnimation";

export function Canvas() {
  const { t } = useTranslation();
  const {
    canvas,
    undo,
    redo,
    clear,
    getDataUrl,
    canUndo,
    canRedo,
    isEmpty,
    isEraser,
    toggleEraser,
    isUntouched,
  } = useCanvas();
  const paths = useStore.use.paths();
  const updateProblem = useStore.use.updateProblem();
  const activeProblemId = useStore.use.activeProblemId();
  const activeAssignmentId = useStore.use.activeAssignmentId();
  const { setEvaluationResult } = useEvaluationResult();
  const setUsageLimitReached = useStore.use.setUsageLimitReached();
  const activeProblem = useActiveProblem();
  const [helpOpen, setHelpOpen] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const {
    messages,
    setMessages,
    setRecommendedQuestions,
    newAssistantMessage,
  } = useHelp();
  const trackEvent = useTrackEvent();

  const { mutate: submit, isPending: isSubmitting } =
    api.assignment.submitSolution.useMutation({
      onSuccess: (result) => {
        setEvaluationResult(activeProblem?.id ?? "", result);
        console.log(result);
        const newMessages: Message[] = [];
        if (result.hasMistakes) {
          newMessages.push(
            newAssistantMessage(t("assignment.feedback.hasMistakes")),
          );
        } else if (!result.isComplete) {
          newMessages.push(
            newAssistantMessage(t("assignment.feedback.notComplete")),
          );
        } else {
          setCelebrationOpen(true);
        }
        if (newMessages.length > 0) {
          if (result.hint) {
            newMessages.push(newAssistantMessage(result.hint));
          }
          setMessages([...messages, ...newMessages]);
          setRecommendedQuestions(result.followUpQuestions);
          setHelpOpen(true);
        }
      },
      onError: (error) => {
        if (error.message === "Free tier limit reached") {
          setUsageLimitReached(true);
        } else {
          toast.error(`Error submitting solution: ${error.message}`);
        }
      },
    });

  const onCheck = (dataUrl: string) => {
    if (activeProblem) {
      submit({
        exerciseText: activeProblem.problem,
        solutionImage: dataUrl,
        referenceSolution: activeProblem.referenceSolution ?? "N/A",
      });
    }
  };

  return (
    <div className="canvas-section relative h-full w-full overflow-hidden">
      {canvas}

      <div className="pointer-events-none absolute left-4 top-20 z-10 flex items-end space-x-4 lg:top-4">
        <WritingAnimation hidden={!isUntouched} delay={5000} />
      </div>

      <div className="absolute right-4 top-4 z-10 flex items-end space-x-4">
        <Button
          variant={isEraser ? "default" : "outline"}
          onClick={toggleEraser}
          title={isEraser ? "Switch to Pen" : "Switch to Eraser"}
        >
          {isEraser ? (
            <Pencil className="h-4 w-4" />
          ) : (
            <Eraser className="h-4 w-4" />
          )}
        </Button>
        <Button variant="outline" onClick={clear} disabled={isEmpty}>
          <Trash className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={undo} disabled={!canUndo}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={redo} disabled={!canRedo}>
          <Redo className="h-4 w-4" />
        </Button>
        <Button
          onClick={async () => {
            trackEvent("clicked_check_solution");
            const dataUrl = await getDataUrl();
            if (!dataUrl) return;
            updateProblem({
              id: activeProblemId ?? "",
              assignmentId: activeAssignmentId ?? "",
              canvas: { paths },
            });
            onCheck(dataUrl);
          }}
          disabled={isEmpty || isSubmitting}
          className="check-answer-button"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <Trans i18nKey="check" />
        </Button>
      </div>
      <div className="absolute right-4 top-[4rem] z-10 flex max-h-[calc(100%-5rem)]">
        <HelpButton
          key={activeProblemId}
          getCanvasDataUrl={getDataUrl}
          open={helpOpen}
          setOpen={setHelpOpen}
        />
      </div>
      <CelebrationDialog open={celebrationOpen} setOpen={setCelebrationOpen} />
    </div>
  );
}
