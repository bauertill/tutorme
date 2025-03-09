"use client";
import { Latex } from "@/app/_components/Latex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NewProblemButton from "./NewProblemButton";

export default function ProblemView({
  problem,
  onNewProblem,
}: {
  problem: string;
  onNewProblem: (problem: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Exercise</CardTitle>
        <NewProblemButton onNewProblem={onNewProblem} />
      </CardHeader>
      <CardContent className="whitespace-pre-wrap">
        <Latex>{problem}</Latex>
      </CardContent>
    </Card>
  );
}
