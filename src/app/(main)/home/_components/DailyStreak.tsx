"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { useMemo } from "react";

export function DailyStreak() {
  const { data: solutions = [] } =
    api.studentSolution.listStudentSolutions.useQuery();

  const { streak, weekData } = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const s of solutions) {
      if (s.status !== "SOLVED") continue;
      const completedAt = (s as { completedAt?: Date } | undefined)
        ?.completedAt;
      const d = new Date(completedAt ?? s.updatedAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      byDay.set(key, (byDay.get(key) ?? 0) + 1);
    }

    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const hadSolved = (byDay.get(key) ?? 0) > 0;
      if (hadSolved) currentStreak += 1;
      else break;
    }

    const days = ["M", "T", "W", "Th", "F"];
    const monday = new Date(today);
    const dayOfWeek = (today.getDay() + 6) % 7; // 0=Mon
    monday.setDate(today.getDate() - dayOfWeek);
    const weekData = days.map((label, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const completed = (byDay.get(key) ?? 0) > 0;
      const isToday = d.toDateString() === today.toDateString();
      return { day: label, completed, isToday };
    });

    return { streak: currentStreak, weekData };
  }, [solutions]);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
              <div className="text-2xl font-bold text-white">⚡</div>
            </div>
            <Badge
              variant="secondary"
              className="absolute -right-2 -top-2 bg-yellow-500 px-2 py-1 font-bold text-white"
            >
              {streak}
            </Badge>
          </div>
        </div>

        <div className="mb-4 text-center">
          <h3 className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {streak} Day Streak
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Keep it up!
          </p>
        </div>

        <div className="flex justify-center gap-3">
          {weekData.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  day.completed
                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md"
                    : day.isToday
                      ? "border-2 border-yellow-400 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                      : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                }`}
              >
                {day.completed ? "⚡" : day.day}
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {day.day}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
