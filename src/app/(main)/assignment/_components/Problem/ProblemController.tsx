"use client";
import { Latex } from "@/app/_components/Latex";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useProblemController } from "@/store/selectors";
import { UploadProblems } from "./UploadProblems";

export default function ProblemController() {
  const {
    activeAssignment,
    activeProblem,
    gotoNextProblem,
    gotoPreviousProblem,
  } = useProblemController();

  if (!activeProblem || !activeAssignment) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>To get started, upload your own problems</CardTitle>
          <div className="flex flex-row gap-2">
            <UploadProblems />
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-row items-center justify-between border-b p-4">
      <Latex className="whitespace-pre-wrap">{activeProblem.problem}</Latex>
      <div className="flex flex-row gap-2">
        <Button
          variant="outline"
          disabled={!gotoPreviousProblem}
          onClick={() => gotoPreviousProblem && gotoPreviousProblem()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={!gotoNextProblem}
          onClick={() => gotoNextProblem && gotoNextProblem()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
