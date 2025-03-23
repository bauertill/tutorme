"use client";
import { Latex } from "@/app/_components/richtext/Latex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { type EvaluationResult } from "@/core/assignment/types";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store";
import { useActiveProblem } from "@/store/selectors";
import { api } from "@/trpc/react";
import { HelpCircle, Info, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function FeedbackView({
  evaluationResult,
}: {
  evaluationResult: EvaluationResult;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const activeProblem = useActiveProblem();
  const setProblem = useStore.use.updateProblem();
  const setUsageLimitReached = useStore.use.setUsageLimitReached();
  const { mutate: explainHint, isPending: isExplainPending } =
    api.assignment.explainHint.useMutation({
      onSuccess: (data) => {
        setSelectedText("");
        setProblem(data);
      },
      onError: (error) => {
        if (error.message === "Free tier limit reached") {
          setUsageLimitReached(true);
        } else {
          toast.error(`Error explaining hint: ${error.message}`);
        }
      },
    });

  const handleExplainRequest = () => {
    if (!activeProblem || !selectedText) return;
    explainHint({
      userProblem: activeProblem,
      highlightedText: selectedText,
    });
  };

  useEffect(() => {
    setIsOpen(true);
    setSelectedText("");
  }, [evaluationResult]);

  if (!isOpen) return null;

  return (
    <Card className="relative">
      <Collapsible>
        <CollapsibleTrigger className="absolute bottom-4 right-4">
          <Info className="h-4 w-4" />
        </CollapsibleTrigger>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {evaluationResult.hasMistakes
              ? t("assignment.feedback.hasMistakes")
              : evaluationResult.isComplete
                ? t("assignment.feedback.isComplete")
                : t("assignment.feedback.notComplete")}
          </CardTitle>

          <div className="absolute right-0 top-0 m-2 mt-8 flex items-center gap-2">
            {selectedText && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExplainRequest}
                className="flex items-center gap-1"
                disabled={isExplainPending}
              >
                <HelpCircle className="h-3 w-3" />
                Explain
                {isExplainPending && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="whitespace-pre-wrap pb-16">
          <div className="flex flex-col gap-4">
            {(evaluationResult.hasMistakes || !evaluationResult.isComplete) &&
              evaluationResult.hint && (
                <div className="relative mb-10 mt-4 cursor-text select-text text-sm text-muted-foreground">
                  <Latex onTextHighlight={setSelectedText}>
                    {evaluationResult.hint}
                  </Latex>
                </div>
              )}

            <CollapsibleContent className="flex flex-col gap-4">
              <Latex>{evaluationResult.studentSolution}</Latex>
              <Latex>{evaluationResult.analysis}</Latex>
            </CollapsibleContent>
          </div>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
