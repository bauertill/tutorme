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
  const getStatusText = (status: string) => {
    if (status === "ACTIVE") return "Active";
    if (status === "DONE") return "Done";
    if (status === "DONE_WITH_HELP") return "Done";
    if (status === "PAUSED") return "Paused";
    return "To Do";
  };

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-md"
      onClick={() => setActiveLesson(lesson)}
    >
      <div className="flex h-12 items-center justify-between gap-4 px-4">
        <div className="grow-1 gap-3 overflow-hidden">
          <p className="truncate text-sm text-muted-foreground">
            {lesson.lessonGoal}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Badge className={getStatusColor(lesson.status)}>
            {getStatusText(lesson.status)}
          </Badge>
          <ChevronRight className="h-5 w-5 shrink-0 transform text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Card>
  );
}
