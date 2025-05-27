"use client";
import { useTrackEvent } from "@/app/_components/GoogleTagManager";
import { Button } from "@/components/ui/button";
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CelebrationDialog } from "./CelebrationDialog";
import HelpButton from "./HelpButton";
import { useCanvas } from "./useCanvas";

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
  } = useCanvas();
  const storeCurrentPathsOnProblem = useStore.use.storeCurrentPathsOnProblem();
  const activeProblemId = useStore.use.activeProblemId();
  const { evaluationResult, setEvaluationResult } = useEvaluationResult();
  const setUsageLimitReached = useStore.use.setUsageLimitReached();
  const activeProblem = useActiveProblem();
  const [helpOpen, setHelpOpen] = useState(true);
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
        if (!result.hasMistakes && result.isComplete) {
          setCelebrationOpen(true);
        } else {
          let message = "";
          if (result.hasMistakes) {
            message = t("assignment.feedback.hasMistakes");
          } else if (!result.isComplete) {
            message = t("assignment.feedback.notComplete");
          }
          if (result.hint) {
            message += `\n${result.hint}`;
          }
          if (message) {
            setMessages([...messages, newAssistantMessage(message)]);
          }
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

  useEffect(() => {
    setHelpOpen(true);
  }, [activeProblemId]);

  const onCheck = useCallback(
    (dataUrl: string) => {
      if (activeProblem) {
        submit({
          problemId: activeProblem.id,
          exerciseText: activeProblem.problem,
          solutionImage: dataUrl,
          referenceSolution: activeProblem.referenceSolution ?? "N/A",
        });
      }
    },
    [activeProblem, submit],
  );

  const controls = useMemo(
    () => (
      <>
        <div className="absolute right-4 top-4 z-10 flex items-end space-x-4">
          <Button
            variant={!isEraser ? "default" : "outline"}
            onClick={() => void toggleEraser(false)}
            title={"Switch to Pencil"}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant={isEraser ? "default" : "outline"}
            onClick={() => void toggleEraser(true)}
            title={"Switch to Eraser"}
          >
            <Eraser className="h-4 w-4" />
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
              storeCurrentPathsOnProblem();
              onCheck(dataUrl);
            }}
            disabled={isEmpty || isSubmitting}
            className="check-answer-button flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <Trans i18nKey="check" />
          </Button>
        </div>
        <div className="absolute right-4 top-[4rem] z-10 flex h-[calc(100%-5rem)]">
          <HelpButton
            key={activeProblemId}
            getCanvasDataUrl={getDataUrl}
            open={helpOpen}
            setOpen={setHelpOpen}
          />
        </div>
        <CelebrationDialog
          evaluationResult={evaluationResult}
          open={celebrationOpen}
          setOpen={setCelebrationOpen}
        />
      </>
    ),
    [
      activeProblemId,
      getDataUrl,
      isEmpty,
      isSubmitting,
      helpOpen,
      setHelpOpen,
      celebrationOpen,
      setCelebrationOpen,
      canUndo,
      canRedo,
      toggleEraser,
      clear,
      isEraser,
      storeCurrentPathsOnProblem,
      onCheck,
      trackEvent,
      undo,
      redo,
      evaluationResult,
    ],
  );
  return useMemo(
    () => (
      <div className="canvas-section relative h-full w-full overflow-hidden">
        {canvas}

        {controls}
      </div>
    ),
    [canvas, controls],
  );
}
