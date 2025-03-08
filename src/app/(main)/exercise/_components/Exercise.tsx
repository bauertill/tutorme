"use client";
import { Latex } from "@/app/_components/Latex";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { useCanvas } from "./Canvas";

export function Exercise({ exerciseText }: { exerciseText: string }) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [debouncedImageData] = useDebounce(imageData, 1000, { maxWait: 2000 });
  const { canvas, clearCanvas } = useCanvas({ onChange: setImageData });
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

  const doSubmit = useCallback(() => {
    if (debouncedImageData) {
      submit({
        exerciseText,
        solutionImage: debouncedImageData,
      });
    }
  }, [debouncedImageData, submit, exerciseText]);

  useEffect(() => {
    doSubmit();
  }, [debouncedImageData, doSubmit]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="h-full w-full flex-1 rounded-lg p-4 text-lg">
        {exerciseText}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Your Solution</h3>
          <div className="flex items-center gap-2">
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CheckCircle className="text-green-500" />
            )}
            <Button variant="outline" onClick={clearCanvas}>
              Clear
            </Button>
          </div>
        </div>

        {canvas}

        {feedback && (
          <Alert>
            {feedback.isCorrect ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Correct Solution</AlertTitle>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                <AlertTitle>Needs Improvement</AlertTitle>
              </>
            )}
            <AlertDescription className="whitespace-pre-wrap">
              <Latex>{feedback.feedback}</Latex>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
