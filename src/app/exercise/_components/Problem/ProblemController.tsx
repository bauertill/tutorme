"use client";
import { Latex } from "@/app/_components/Latex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RandomProblemButton from "./RandomProblemButton";
import { UploadProblems } from "./UploadProblems";
export default function ProblemController({
  problem,
  setProblem,
}: {
  problem: string;
  setProblem: (problem: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Exercise</CardTitle>
        <div className="flex flex-row gap-2">
          <RandomProblemButton onNewProblem={setProblem} />
          <UploadProblems />
        </div>
      </CardHeader>
      <CardContent className="whitespace-pre-wrap">
        <Latex>{problem}</Latex>
      </CardContent>
    </Card>
  );
}
