"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface LessonPreviewProps {
  title?: string;
  level?: number;
  practiceTime?: string;
  onStart?: () => void;
}

export function LessonPreview({
  title = "Solving Equations",
  level = 1,
  practiceTime = "2 min",
  onStart = () => console.log("Starting lesson..."),
}: LessonPreviewProps) {
  const [isResuming] = useState(false);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-6 text-center">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800">
            LEVEL {level}
          </Badge>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">{title}</h2>
          <div className="mb-4 text-sm text-gray-600">
            Practice • {practiceTime}
          </div>
        </div>

        <div className="mb-6 flex justify-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
            <div className="text-4xl text-white">⚖️</div>
          </div>
        </div>

        <Button
          onClick={onStart}
          className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
        >
          {isResuming ? "Continue" : "Start"}
        </Button>

        <div className="mt-6 flex justify-center gap-4">
          {/* Mock lesson type icons */}
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <span className="text-xl">⚖️</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <span className="text-xl">🧮</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <span className="text-xl">🐕</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <span className="text-xl">⚙️</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <span className="text-xl">🌍</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
