"use client";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import FeedbackView from "./FeedbackView";
import ProblemView from "./ProblemView";
import { SVGCanvasWithControls } from "./SVGCanvas";

export default function Exercise() {
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    feedback: string;
  } | null>(null);
  const { mutate: submit, isPending: isSubmitting } =
    api.exercise.submitSolution.useMutation({
      onSuccess: (data) => {
        toast.success("Solution submitted and evaluated");
        setFeedback({
          isCorrect: data.isCorrect,
          feedback: data.feedback,
        });
      },
      onError: (error) => {
        toast.error(`Error submitting solution: ${error.message}`);
        setFeedback(null);
      },
    });

  const onCheck = useCallback(
    (dataUrl: string) => {
      submit({
        exerciseText: "test",
        solutionImage: dataUrl,
      });
    },
    [submit],
  );
  return (
    <div className="relative flex h-full flex-col">
      <ProblemView />
      <SVGCanvasWithControls onCheck={onCheck} />
      {feedback && (
        <FeedbackView
          isCorrect={feedback.isCorrect}
          feedback={feedback.feedback}
        />
      )}
      {isSubmitting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      )}
    </div>
  );
}
