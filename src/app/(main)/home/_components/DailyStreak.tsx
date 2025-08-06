"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface DailyStreakProps {
  streak?: number;
}

export function DailyStreak({ streak = 1 }: DailyStreakProps) {
  // Mock data for the week - in a real app this would come from props/server
  const [weekData] = useState([
    { day: "M", completed: true, isToday: true },
    { day: "T", completed: false, isToday: false },
    { day: "W", completed: false, isToday: false },
    { day: "Th", completed: false, isToday: false },
    { day: "F", completed: false, isToday: false },
  ]);

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
