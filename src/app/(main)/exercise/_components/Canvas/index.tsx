"use client";
import { Button } from "@/components/ui/button";
import { Redo, Sparkles, Trash, Undo } from "lucide-react";
import { useCanvas } from "./useCanvas";

export function Canvas({ onCheck }: { onCheck: (dataUrl: string) => void }) {
  const { canvas, undo, redo, clear, getDataUrl, canUndo, canRedo, isEmpty } =
    useCanvas();
  return (
    <div className="relative h-full w-full overflow-hidden">
      {canvas}

      <div className="absolute right-4 top-4 z-10 flex space-x-2">
        {!isEmpty && (
          <Button variant="outline" onClick={clear}>
            <Trash className="h-4 w-4" />
          </Button>
        )}
        <Button variant="outline" onClick={undo} disabled={!canUndo}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={redo} disabled={!canRedo}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      {!isEmpty && (
        <div className="absolute bottom-4 right-4 z-10 flex space-x-2">
          <Button
            onClick={async () => {
              const dataUrl = await getDataUrl();
              if (!dataUrl) return;
              onCheck(dataUrl);
            }}
          >
            <Sparkles className="h-4 w-4" />
            Check
          </Button>
        </div>
      )}
    </div>
  );
}
