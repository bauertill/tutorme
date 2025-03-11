"use client";
import { Latex } from "@/app/_components/Latex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCurrentAssignment,
  useCurrentProblem,
  useGotoNextProblem,
  useGotoPreviousProblem,
  useNextProblem,
  usePreviousProblem,
} from "@/store/selectors";
import { UploadProblems } from "./UploadProblems";

export default function ProblemController() {
  const assignment = useCurrentAssignment();
  const currentProblem = useCurrentProblem();
  const nextProblem = useNextProblem();
  const previousProblem = usePreviousProblem();
  const gotoNextProblem = useGotoNextProblem();
  const gotoPreviousProblem = useGotoPreviousProblem();

  if (!currentProblem || !assignment) {
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Assignment: {assignment.name}</CardTitle>
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
          <UploadProblems />
        </div>
      </CardHeader>
      <CardContent className="whitespace-pre-wrap">
        <Latex>{currentProblem.problem}</Latex>
      </CardContent>
    </Card>
  );
}
