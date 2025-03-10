"use client";
import { type EvaluationResult } from "@/core/exercise/exerciseDomain";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { Canvas } from "./Canvas";
import FeedbackView from "./FeedbackView";
import ProblemController from "./Problem/ProblemController";

export default function Exercise() {
  const [problem, setProblem] = useState<string>("");
  const [debouncedProblem] = useDebounce(problem, 5000);
  const [referenceSolution, setReferenceSolution] = useState<string>();
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);

  const { mutate: createReferenceSolution } =
    api.exercise.createReferenceSolution.useMutation({
      onSuccess: (data) => {
        setReferenceSolution(data);
      },
    });

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

  useEffect(() => {
    setReferenceSolution(undefined);
    createReferenceSolution(debouncedProblem);
  }, [debouncedProblem, createReferenceSolution]);

  const onCheck = (dataUrl: string) => {
    submit({
      exerciseText: problem,
      solutionImage: dataUrl,
      referenceSolution: referenceSolution ?? "N/A",
    });
  };

  return (
    <div className="relative flex h-full flex-col">
      <ProblemController problem={problem} setProblem={setProblem} />
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
