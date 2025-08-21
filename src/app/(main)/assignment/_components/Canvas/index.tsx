"use client";

import { useTrackEvent } from "@/app/_components/GoogleTagManager";
import { Button } from "@/components/ui/button";
import { type Path } from "@/core/canvas/canvas.types";
import { type Problem } from "@/core/problem/problem.types";
import {
  type EvaluationResult,
  type StudentSolution,
} from "@/core/studentSolution/studentSolution.types";
import { useHelp } from "@/hooks/use-help";
import { useSaveCanvasPeriodically } from "@/hooks/use-save-canvas-periodically";
import { Trans, useTranslation } from "@/i18n/react";
import { useStore } from "@/store";
import { useActiveProblem } from "@/store/problem.selectors";
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
    getPathsForSubmit,
  } = useCanvas();
  const setUsageLimitReached = useStore.use.setUsageLimitReached();
  const setPaths = useStore.use.setPaths();
  const activeProblem = useActiveProblem();
  const [studentSolutions] =
    api.studentSolution.listStudentSolutions.useSuspenseQuery();

  const studentSolution = studentSolutions.find(
    (solution) => solution.problemId === activeProblem?.id,
  );

  const [helpOpen, setHelpOpen] = useState(true);
  const [celebrationOpen, setCelebrationOpen] = useState(false);

  const { mutateAsync: upsertCanvasAsync } =
    api.studentSolution.setStudentSolutionCanvas.useMutation();

  const help = useHelp(studentSolution?.id ?? "");
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

  const { mutate: submit, isPending: isSubmitting } =
    api.studentSolution.submitSolution.useMutation({
      onSuccess: async (evaluation) => {
        await handleSubmitSuccess(
          evaluation,
          studentSolution,
          getPathsForSubmit,
          upsertCanvasAsync,
          setStudentSolutionEvaluation,
          utils,
          setCelebrationOpen,
          help,
          setHelpOpen,
          t,
        );
      },
      onError: (error) => {
        handleSubmitError(error, setUsageLimitReached);
      },
    });

  useSaveCanvasPeriodically();

  useEffect(() => {
    if (!activeProblem?.id) return;

    const studentSolution = studentSolutions.find(
      (s) => s.problemId === activeProblem.id,
    );
    if (studentSolution) {
      const savedPaths = parseCanvasFromStudentSolution(studentSolution);
      setPaths(savedPaths);
    }

    setHelpOpen(true);
  }, [activeProblem?.id, studentSolutions, setPaths, setHelpOpen]);

  const onCheck = useCallback(
    (dataUrl: string, pathsForSubmit: Path[]) => {
      if (activeProblem) {
        if (studentSolution) {
          submit({
            problemId: activeProblem.id,
            studentSolutionId: studentSolution.id,
            exerciseText: activeProblem.problem,
            canvas: { paths: pathsForSubmit },
            solutionImage: dataUrl,
            referenceSolution: activeProblem.referenceSolution ?? "N/A",
          });
        }
      }
    },
    [activeProblem, submit, studentSolution],
  );

  const controls = useMemo(
    () => (
      <>
        {renderToolbar({
          studentSolution,
          isEraser,
          toggleEraser,
          clear,
          isEmpty,
          undo,
          canUndo,
          redo,
          canRedo,
          onCheck,
          getDataUrl,
          activeProblem,
          getPathsForSubmit,
          trackEvent,
          isSubmitting,
        })}

        <div className="absolute right-4 top-[4rem] z-50 flex h-[calc(100%-5rem)]">
          <HelpButton
            key={activeProblem?.id}
            getCanvasDataUrl={getDataUrl}
            open={helpOpen}
            setOpen={setHelpOpen}
            isSubmitting={isSubmitting}
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
      studentSolution,
      isEraser,
      toggleEraser,
      clear,
      isEmpty,
      undo,
      canUndo,
      redo,
      canRedo,
      onCheck,
      getDataUrl,
      activeProblem,
      getPathsForSubmit,
      trackEvent,
      isSubmitting,
      helpOpen,
      setHelpOpen,
      celebrationOpen,
      setCelebrationOpen,
    ],
  );

  const canvasWithControls = useMemo(
    () => (
      <div className="canvas-section relative h-full w-full overflow-hidden">
        {canvas}
        {controls}
      </div>
    ),
    [canvas, controls],
  );

  return canvasWithControls;
}

async function handleSubmitSuccess(
  evaluation: EvaluationResult,
  studentSolution: StudentSolution | undefined,
  getPathsForSubmit: () => Path[],
  upsertCanvasAsync: ReturnType<
    typeof api.studentSolution.setStudentSolutionCanvas.useMutation
  >["mutateAsync"],
  setStudentSolutionEvaluation: (input: {
    studentSolutionId: string;
    evaluation: EvaluationResult;
  }) => void,
  utils: ReturnType<typeof api.useUtils>,
  setCelebrationOpen: (open: boolean) => void,
  help: ReturnType<typeof useHelp>,
  setHelpOpen: (open: boolean) => void,
  t: (key: string) => string,
) {
  if (!studentSolution) return;

  const evaluatedPaths = getPathsForSubmit();
  await upsertCanvasAsync({
    problemId: studentSolution.problemId,
    studentSolutionId: studentSolution.id,
    canvas: { paths: evaluatedPaths },
  });

  setStudentSolutionEvaluation({
    studentSolutionId: studentSolution.id,
    evaluation,
  });

  if (!evaluation.hasMistakes && evaluation.isComplete) {
    utils.studentSolution.listStudentSolutions.setData(
      undefined,
      (old) =>
        old?.map((s) =>
          s.id === studentSolution.id ? { ...s, status: "SOLVED" as const } : s,
        ) ?? old,
    );
    await Promise.all([
      utils.studentSolution.listStudentSolutions.invalidate(),
      utils.assignment.getDailyProgress.invalidate(),
    ]);
    setCelebrationOpen(true);
    return;
  }

  void utils.studentSolution.listStudentSolutions.invalidate();
  void utils.assignment.getDailyProgress.invalidate();

  const message = buildFeedbackMessage(evaluation, t);
  if (message) {
    help.addMessage(help.newAssistantMessage(message));
  }
  help.setRecommendedQuestions(evaluation.followUpQuestions);
  setHelpOpen(true);
}

function buildFeedbackMessage(
  evaluation: EvaluationResult,
  t: (key: string) => string,
): string {
  let message = "";
  if (!evaluation.isLegible) {
    message = t("assignment.feedback.notLegible");
  } else if (evaluation.hasMistakes) {
    message = t("assignment.feedback.hasMistakes");
  } else if (!evaluation.isComplete) {
    message = t("assignment.feedback.notComplete");
  }

  if (evaluation.hint) {
    message += `\n${evaluation.hint}`;
  }

  return message;
}

function parseCanvasFromStudentSolution(
  studentSolution: StudentSolution,
): Path[] {
  const raw = studentSolution.canvas as unknown;
  const obj =
    typeof raw === "string"
      ? (JSON.parse(raw) as { paths?: Path[] })
      : (raw as { paths?: Path[] } | undefined);
  return obj?.paths ?? [];
}

function renderToolbar({
  studentSolution,
  isEraser,
  toggleEraser,
  clear,
  isEmpty,
  undo,
  canUndo,
  redo,
  canRedo,
  onCheck,
  getDataUrl,
  activeProblem,
  getPathsForSubmit,
  trackEvent,
  isSubmitting,
}: {
  studentSolution: StudentSolution | undefined;
  isEraser: boolean;
  toggleEraser: (enabled?: boolean) => void;
  clear: () => void;
  isEmpty: boolean;
  undo: () => void;
  canUndo: boolean;
  redo: () => void;
  canRedo: boolean;
  onCheck: (dataUrl: string, pathsForSubmit: Path[]) => void;
  getDataUrl: () => Promise<string | null>;
  activeProblem: Problem | null;
  getPathsForSubmit: () => Path[];
  trackEvent: ReturnType<typeof useTrackEvent>;
  isSubmitting: boolean;
}) {
  return (
    <div className="absolute right-4 top-4 z-10 flex items-end space-x-4">
      <LLMFeedbackButton
        latestEvaluateSolutionRunId={
          studentSolution?.evaluation?.evaluateSolutionRunId ?? ""
        }
      />
      <Button
        variant={!isEraser ? "default" : "outline"}
        onClick={() => void toggleEraser(false)}
        title="Switch to Pencil"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant={isEraser ? "default" : "outline"}
        onClick={() => void toggleEraser(true)}
        title="Switch to Eraser"
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
          if (!dataUrl || !activeProblem) return;
          const toSubmit = getPathsForSubmit();
          onCheck(dataUrl, toSubmit);
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
  );
}

function handleSubmitError(
  error: { message: string },
  setUsageLimitReached: (reached: boolean) => void,
) {
  if (error.message === "Free tier limit reached") {
    setUsageLimitReached(true);
  } else {
    toast.error(`Error submitting solution: ${error.message}`);
  }
}
