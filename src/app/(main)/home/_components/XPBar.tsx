"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/trpc/react";

function computeXp(currentSolvedCount: number, firstTrySolvedCount: number) {
  const baseXp = currentSolvedCount * 10;
  const bonusXp = firstTrySolvedCount * 10;
  return baseXp + bonusXp;
}

function getLevelTarget(currentXp: number) {
  const level = Math.floor(currentXp / 100);
  const target = (level + 1) * 100;
  return { level, target };
}

export function XPBar() {
  const { data: solutions = [] } =
    api.studentSolution.listStudentSolutions.useQuery();

  const solvedSolutions = solutions.filter((s) => s.status === "SOLVED");
  const solvedCount = solvedSolutions.length;
  const firstTrySolvedCount = solvedSolutions.filter(
    (s) => s.evaluation?.hasMistakes === false,
  ).length;

  const currentXp = computeXp(solvedCount, firstTrySolvedCount);
  const { target } = getLevelTarget(currentXp);
  const progress = target > 0 ? Math.min(100, (currentXp / target) * 100) : 0;

  return (
    <Card className="mb-4 w-full">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>XP</span>
          <span>
            {currentXp} / {target}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardContent>
    </Card>
  );
}

export default XPBar;
