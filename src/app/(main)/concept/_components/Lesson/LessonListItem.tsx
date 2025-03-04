"use client";

import type { Lesson } from "@/core/lesson/types";

export function LessonListItem({
  lesson,
  setActiveLesson,
}: {
  lesson: Lesson;
  setActiveLesson: (lesson: Lesson) => void;
}) {
  return (
    <div
      className="mt-6 flex flex-row items-center justify-between gap-4 hover:cursor-pointer hover:bg-accent-hover"
      onClick={() => setActiveLesson(lesson)}
    >
      <h3 className="text-l flex flex-row items-center gap-2">
        {lesson.difficulty}
      </h3>
      <div className="flex flex-row items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            lesson.status === "ACTIVE" ? "bg-accent-foreground" : "bg-accent"
          }`}
        />
        {lesson.status === "ACTIVE" ? (
          <p className="text-sm text-muted-foreground">Active</p>
        ) : (
          <p className="text-sm text-muted-foreground">Completed</p>
        )}
      </div>
    </div>
  );
}
