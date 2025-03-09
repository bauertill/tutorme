"use client";
import { type EvaluationResult } from "@/core/exercise/exerciseDomain";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import FeedbackView from "./FeedbackView";
import ProblemView from "./ProblemView";
import { SVGCanvasWithControls } from "./SVGCanvas";

export default function Exercise() {
  const [problem, setProblem] = useState<string>(`Solve for x: 2x + 3 = 11`);
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);
  const { mutate: submit, isPending: isSubmitting } =
    api.exercise.submitSolution.useMutation({
      onSuccess: (data) => {
        setEvaluationResult(data);
      },
      onError: (error) => {
        toast.error(`Error submitting solution: ${error.message}`);
        setEvaluationResult(null);
      },
    });

  const onCheck = useCallback(
    (dataUrl: string) => {
      submit({
        exerciseText: problem,
        solutionImage: dataUrl,
      });
    },
    [submit, problem],
  );
  return (
    <div className="relative flex h-full flex-col">
      <ProblemView problem={problem} onNewProblem={setProblem} />
      <SVGCanvasWithControls onCheck={onCheck} />
      {evaluationResult && <FeedbackView evaluationResult={evaluationResult} />}
      {isSubmitting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      )}
    </div>
  );
}
