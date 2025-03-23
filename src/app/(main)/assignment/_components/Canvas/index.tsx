"use client";
import { Button } from "@/components/ui/button";
import { Trans } from "@/i18n";
import { useStore } from "@/store";
import { Eraser, Pencil, Redo, Sparkles, Trash, Undo } from "lucide-react";
import HelpButton from "./HelpButton";
import { useCanvas } from "./useCanvas";
import WritingAnimation from "./WritingAnimation";

export function Canvas({ onCheck }: { onCheck: (dataUrl: string) => void }) {
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
  return (
    <div className="relative h-full w-full overflow-hidden">
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
            const dataUrl = await getDataUrl();
            if (!dataUrl) return;
            updateProblem({
              id: activeProblemId ?? "",
              assignmentId: activeAssignmentId ?? "",
              canvas: { paths },
            });
            onCheck(dataUrl);
          }}
          disabled={isEmpty}
        >
          <Sparkles className="h-4 w-4" />
          <Trans i18nKey="check" />
        </Button>
      </div>
      <div className="absolute right-4 top-16 z-10 flex items-end space-x-4">
        <HelpButton />
      </div>
    </div>
  );
}
