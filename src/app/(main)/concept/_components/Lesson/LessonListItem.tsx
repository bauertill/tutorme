"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Lesson } from "@/core/lesson/types";
import { ChevronRight } from "lucide-react";

export function LessonListItem({
  lesson,
  setActiveLesson,
}: {
  lesson: Lesson;
  setActiveLesson: (lesson: Lesson) => void;
}) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "INTERMEDIATE":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "ADVANCED":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "EXPERT":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-yellow-100 text-yellow-800";
      case "DONE":
        return "bg-green-100 text-green-800";
      case "DONE_WITH_HELP":
        return "bg-blue-100 text-blue-800";
      case "PAUSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-md"
      onClick={() => setActiveLesson(lesson)}
    >
      <div className="flex h-12 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <p className="truncate text-sm text-muted-foreground">
            {lesson.lessonGoal}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <Badge className={getDifficultyColor(lesson.difficulty)}>
              {lesson.difficulty}
            </Badge>
            <Badge className={getStatusColor(lesson.status)}>
              {lesson.status === "ACTIVE"
                ? "Active"
                : lesson.status === "DONE"
                  ? "Completed"
                  : lesson.status === "DONE_WITH_HELP"
                    ? "Completed with Help"
                    : lesson.status === "PAUSED"
                      ? "Paused"
                      : "To Do"}
            </Badge>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 transform text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
    </Card>
  );
}
