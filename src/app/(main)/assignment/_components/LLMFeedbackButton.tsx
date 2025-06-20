"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/react-auth";
import { api } from "@/trpc/react";
import { Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

const ADMINS = [
  "max@mxgr.de",
  "bauertill@gmail.com",
  "maksymiukdavid@gmail.com",
];

export function LLMFeedbackButton({
  latestEvaluateSolutionRunId,
}: {
  latestEvaluateSolutionRunId: string;
}) {
  const { session } = useAuth();

  // Only show for superadmins
  const isAdmin = session?.user?.email && ADMINS.includes(session.user.email);
  const {
    mutate: addPositiveSampleToQualityControlDataset,
    isPending: isAddingPositiveSample,
  } = api.studentSolution.addPositiveSampleToQualityControlDataset.useMutation({
    onSuccess: () => {
      toast.success("Added positive sample to quality control dataset");
    },
  });

  if (!isAdmin || !latestEvaluateSolutionRunId) {
    return null;
  }

  const handleFeedback = async (type: "up" | "down") => {
    console.log(`LLM Feedback: ${type}`);
    if (type === "up") {
      addPositiveSampleToQualityControlDataset({
        runId: latestEvaluateSolutionRunId,
      });
    } else {
      console.log("THUMBS DOWN");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="lg"
        onClick={() => handleFeedback("up")}
        className="flex items-center gap-2"
        disabled={isAddingPositiveSample}
      >
        {isAddingPositiveSample ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <ThumbsUp className="h-6 w-6" />
        )}
        Good
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={() => handleFeedback("down")}
        className="flex items-center gap-2"
      >
        <ThumbsDown className="h-6 w-6" />
        Bad
      </Button>
    </div>
  );
}
