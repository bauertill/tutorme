"use client";
import { type EvaluationResult } from "@/core/exercise/exerciseDomain";
import { useActiveProblem } from "@/store/selectors";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { Canvas } from "./Canvas";
import FeedbackView from "./FeedbackView";
import ProblemController from "./Problem/ProblemController";

export default function Exercise() {
  const activeProblem = useActiveProblem();
  const problem = activeProblem?.problem;
  const [debouncedProblem] = useDebounce(problem, 5000);
  const [referenceSolution, setReferenceSolution] = useState<string>();
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);

  const { mutate: createReferenceSolution } =
    api.assignment.createReferenceSolution.useMutation({
      onSuccess: (data) => {
        setReferenceSolution(data);
      },
    });

  const { mutate: submit, isPending: isSubmitting } =
    api.assignment.submitSolution.useMutation({
      onSuccess: (data) => {
        setEvaluationResult(data);
      },
      onError: (error) => {
        toast.error(`Error submitting solution: ${error.message}`);
        setEvaluationResult(null);
      },
    });

  useEffect(() => {
    setReferenceSolution(undefined);
    if (debouncedProblem) {
      createReferenceSolution(debouncedProblem);
    }
  }, [debouncedProblem, createReferenceSolution]);

  const onCheck = (dataUrl: string) => {
    if (!problem) {
      return;
    }
    submit({
      exerciseText: problem,
      solutionImage: dataUrl,
      referenceSolution: referenceSolution ?? "N/A",
    });
  };

  if (!problem) {
    return <div>No problem selected</div>;
  }

  return (
    <div className="relative flex h-full flex-col">
      <ProblemController />
      {problem && <Canvas onCheck={onCheck} />}
      {evaluationResult && <FeedbackView evaluationResult={evaluationResult} />}
      {isSubmitting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      )}
    </div>
  );
}
