"use client";
import { useTrackEvent } from "@/app/_components/GoogleTagManager";
import { Button } from "@/components/ui/button";
import { type Path } from "@/core/canvas/canvas.types";
import { useHelp } from "@/hooks/use-help";
import { useSaveCanvasPeriodically } from "@/hooks/use-save-canvas-periodically";
import { Trans, useTranslation } from "@/i18n/react";
import { useStore } from "@/store";
import {
  useActiveAssignmentId,
  useActiveProblem,
} from "@/store/problem.selectors";
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
import { LLMFeedbackButton } from "../LLMFeedbackButton";
import { CelebrationDialog } from "./CelebrationDialog";
import HelpButton from "./HelpButton";
import { useCanvas } from "./useCanvas";

export function Canvas() {
  const utils = api.useUtils();
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
    paths,
  } = useCanvas();
  const activeAssignmentId = useActiveAssignmentId();
  const [activeAssignment] =
    api.assignment.getStudentAssignment.useSuspenseQuery(
      activeAssignmentId ?? "",
    );
  const activeProblemId = useStore.use.activeProblemId();
  const setUsageLimitReached = useStore.use.setUsageLimitReached();
  const activeProblem = useActiveProblem();
  const [studentSolution] =
    api.studentSolution.listStudentSolutions.useSuspenseQuery(undefined, {
      select: (data) => {
        const studentSolution = data.find(
          (solution) =>
            solution.problemId === activeProblemId &&
            solution.studentAssignmentId === activeAssignmentId,
        );
        if (!studentSolution) {
          throw new Error("Student solution not found");
        }
        return studentSolution;
      },
    });
  const [helpOpen, setHelpOpen] = useState(true);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const { addMessage, setRecommendedQuestions, newAssistantMessage } = useHelp(
    studentSolution.id,
  );
  const { mutate: setStudentSolutionEvaluation } =
    api.studentSolution.setStudentSolutionEvaluation.useMutation({
      onMutate: ({ studentSolutionId, evaluation }) => {
        utils.studentSolution.listStudentSolutions.setData(undefined, (old) =>
          old?.map((s) =>
            s.id === studentSolutionId ? { ...s, evaluation } : s,
          ),
        );
      },
    });
  const trackEvent = useTrackEvent();

  useSaveCanvasPeriodically();

  const { mutate: submit, isPending: isSubmitting } =
    api.studentSolution.submitSolution.useMutation({
      onSuccess: (evaluation) => {
        setStudentSolutionEvaluation({
          studentSolutionId: studentSolution.id,
          evaluation,
        });

        if (!evaluation.hasMistakes && evaluation.isComplete) {
          setCelebrationOpen(true);
          return;
        }
        let message = "";
        if (!evaluation.isLegible)
          message = t("assignment.feedback.notLegible");
        else if (evaluation.hasMistakes)
          message = t("assignment.feedback.hasMistakes");
        else if (!evaluation.isComplete)
          message = t("assignment.feedback.notComplete");

        if (evaluation.hint) message += `\n${evaluation.hint}`;
        if (message) addMessage(newAssistantMessage(message));
        setRecommendedQuestions(evaluation.followUpQuestions);
        setHelpOpen(true);
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
    (dataUrl: string, paths: Path[]) => {
      if (activeProblem && activeAssignment) {
        submit({
          studentAssignmentId: activeAssignment.id,
          problemId: activeProblem.id,
          exerciseText: activeProblem.problem,
          canvas: { paths },
          solutionImage: dataUrl,
          referenceSolution: activeProblem.referenceSolution ?? "N/A",
        });
      }
    },
    [activeProblem, submit, activeAssignment],
  );

  const controls = useMemo(
    () => (
      <>
        <div className="absolute right-4 top-4 z-10 flex items-end space-x-4">
          <LLMFeedbackButton
            latestEvaluateSolutionRunId={
              studentSolution.evaluation?.evaluateSolutionRunId ?? ""
            }
          />
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
              if (!activeProblem || !activeAssignment) return;
              onCheck(dataUrl, paths);
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
          evaluationResult={studentSolution?.evaluation ?? null}
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
      paths,
      onCheck,
      trackEvent,
      undo,
      redo,
      activeProblem,
      activeAssignment,
      studentSolution,
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
