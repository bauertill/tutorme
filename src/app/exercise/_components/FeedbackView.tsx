"use client";
import { Latex } from "@/app/_components/Latex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { type EvaluationResult } from "@/core/exercise/exerciseDomain";
import { Info, X } from "lucide-react";
import { useEffect, useState } from "react";
export default function FeedbackView({
  evaluationResult,
}: {
  evaluationResult: EvaluationResult;
}) {
  const [isOpen, setIsOpen] = useState(true);
  useEffect(() => {
    setIsOpen(true);
  }, [setIsOpen]);
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
              ? "That's not quite right"
              : evaluationResult.isComplete
                ? "That's correct!"
                : "Keep going!"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="whitespace-pre-wrap pb-16">
          <div className="flex flex-col gap-4">
            {(evaluationResult.hasMistakes || !evaluationResult.isComplete) &&
              evaluationResult.hint && (
                <div className="mt-4 text-sm text-muted-foreground">
                  <Latex>{evaluationResult.hint}</Latex>
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
