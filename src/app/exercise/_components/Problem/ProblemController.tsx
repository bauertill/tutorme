"use client";
import { Latex } from "@/app/_components/Latex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { useEffect } from "react";
import RandomProblemButton from "./RandomProblemButton";
import { UploadProblems } from "./UploadProblems";
export default function ProblemController({
  problem,
  setProblem,
}: {
  problem: string;
  setProblem: (problem: string) => void;
}) {
  const {
    data: userProblems,
    isFetched,
    refetch,
  } = api.problem.getUserProblems.useQuery();

  const currentProblemIndex = userProblems?.findIndex(
    (userProblem) => userProblem.problem === problem,
  );
  const nextProblemIndex = (currentProblemIndex ?? 0) + 1;
  const nextProblem = userProblems?.[nextProblemIndex]?.problem;
  const previousProblem =
    userProblems?.[(currentProblemIndex ?? 0) - 1]?.problem;

  useEffect(() => {
    if (!problem && isFetched) {
      const firstProblem = userProblems?.[0]?.problem;
      if (firstProblem) setProblem(firstProblem);
    }
  }, [currentProblemIndex, userProblems, setProblem]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Exercise</CardTitle>
        <div className="flex flex-row gap-2">
          {previousProblem && (
            <Button
              variant="outline"
              onClick={() => setProblem(previousProblem)}
            >
              Previous
            </Button>
          )}
          {nextProblem && (
            <Button variant="outline" onClick={() => setProblem(nextProblem)}>
              Next
            </Button>
          )}

          <RandomProblemButton
            setProblem={(problem) => {
              setProblem(problem);
              void refetch();
            }}
          />
          <UploadProblems />
        </div>
      </CardHeader>
      <CardContent className="whitespace-pre-wrap">
        <Latex>{problem}</Latex>
      </CardContent>
    </Card>
  );
}
