import { Latex } from "@/app/_components/Latex";
import { LessonExplanationTurn } from "@/core/lesson/types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function LessonExplanation({
  explanation,
}: {
  explanation: LessonExplanationTurn;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="my-2 rounded bg-muted p-3">
      <button
        onClick={() => setShow(!show)}
        className="flex w-full items-center justify-between"
      >
        <p className="text-m font-semibold capitalize">Explanation</p>
        {show ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>
      {show && (
        <p className="mt-2 whitespace-pre-wrap">
          <Latex>{explanation.text}</Latex>
        </p>
      )}
    </div>
  );
}
