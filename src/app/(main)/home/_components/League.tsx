"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/trpc/react";
import { useMemo, useState } from "react";

interface LeagueProps {
  currentXP?: number;
  targetXP?: number;
}

export function League({ currentXP, targetXP }: LeagueProps) {
  const [isUnlocked] = useState(false);

  const { data: solutions = [] } =
    api.studentSolution.listStudentSolutions.useQuery(undefined, {
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
    });

  const computed = useMemo(() => {
    const solved = solutions.filter((s) => s.status === "SOLVED");
    const firstTry = solved.filter((s) => s.evaluation?.hasMistakes === false);
    const xp = solved.length * 10 + firstTry.length * 10;
    const target = (Math.floor(xp / 100) + 1) * 100; // simple level target every 100 XP
    return { xp, target };
  }, [solutions]);

  const effectiveCurrentXP = currentXP ?? computed.xp;
  const effectiveTargetXP = targetXP ?? computed.target;
  const progressPercentage =
    effectiveTargetXP > 0
      ? Math.min(100, (effectiveCurrentXP / effectiveTargetXP) * 100)
      : 0;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-4">
          <div className="relative">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-lg shadow-lg ${
                isUnlocked
                  ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                  : "bg-gradient-to-br from-gray-400 to-gray-500"
              }`}
            >
              <div className="text-2xl text-white">
                {isUnlocked ? "🏆" : "🔒"}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {isUnlocked ? "LEAGUES UNLOCKED" : "UNLOCK LEAGUES"}
              </h3>
              {!isUnlocked && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-xs text-yellow-800"
                >
                  Coming Soon
                </Badge>
              )}
            </div>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              {effectiveCurrentXP} of {effectiveTargetXP} XP
            </p>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        {!isUnlocked && (
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            Complete more lessons to unlock competitive leagues!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
