"use client";
import { Latex } from "@/app/_components/Latex";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useActiveAssignment,
  useActiveProblem,
  useGotoNextProblem,
  useGotoPreviousProblem,
  useNextProblem,
  usePreviousProblem,
} from "@/store/selectors";
import { UploadProblems } from "./UploadProblems";

export default function ProblemController() {
  const assignment = useActiveAssignment();
  const activeProblem = useActiveProblem();
  const nextProblem = useNextProblem();
  const previousProblem = usePreviousProblem();
  const gotoNextProblem = useGotoNextProblem();
  const gotoPreviousProblem = useGotoPreviousProblem();

  if (!activeProblem || !assignment) {
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
        {previousProblem && (
          <Button variant="outline" onClick={() => gotoPreviousProblem()}>
            Previous
          </Button>
        )}
        {nextProblem && (
          <Button variant="outline" onClick={() => gotoNextProblem()}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
