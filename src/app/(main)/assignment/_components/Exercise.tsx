"use client";
import { useStore } from "@/store";
import { useActiveProblem, useEvaluationResult } from "@/store/selectors";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { Canvas } from "./Canvas";
import FeedbackView from "./FeedbackView";
import ProblemController from "./Problem/ProblemController";

export default function Exercise() {
  const activeProblem = useActiveProblem();
  const [debouncedProblem] = useDebounce(activeProblem, 5000);
  const setReferenceSolution = useStore.use.setReferenceSolution();
  const { evaluationResult, setEvaluationResult } = useEvaluationResult();

  const { mutateAsync: createReferenceSolution } =
    api.assignment.createReferenceSolution.useMutation();

  const { mutate: submit, isPending: isSubmitting } =
    api.assignment.submitSolution.useMutation({
      onSuccess: (data) => {
        setEvaluationResult(activeProblem?.id ?? "", data);
      },
      onError: (error) => {
        toast.error(`Error submitting solution: ${error.message}`);
      },
    });

  useEffect(() => {
    if (debouncedProblem?.referenceSolution === null) {
      void createReferenceSolution(debouncedProblem.problem).then(
        (referenceSolution) => {
          setReferenceSolution(
            referenceSolution,
            debouncedProblem.id,
            debouncedProblem.assignmentId,
          );
        },
      );
    }
  }, [debouncedProblem, createReferenceSolution, setReferenceSolution]);

  const onCheck = (dataUrl: string) => {
    if (activeProblem) {
      submit({
        exerciseText: activeProblem.problem,
        solutionImage: dataUrl,
        referenceSolution: activeProblem.referenceSolution ?? "N/A",
      });
    }
  };

  if (!activeProblem) {
    return <div className="p-4">No problem selected</div>;
  }

  return (
    <div className="relative flex h-full flex-col">
      <ProblemController />
      <Canvas onCheck={onCheck} />
      {evaluationResult && <FeedbackView evaluationResult={evaluationResult} />}
      {isSubmitting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      )}
    </div>
  );
}
