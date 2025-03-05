import { Lesson } from "@/core/lesson/types";
import { LessonListItem } from "./LessonListItem";

export function LessonList({
  lessons,
  setActiveLesson,
}: {
  lessons: Lesson[];
  setActiveLesson: (lesson: Lesson) => void;
}) {
  return (
    <div className="space-y-6">
      {lessons.map((lesson) => (
        <div key={lesson.id}>
          <LessonListItem
            lesson={lesson}
            setActiveLesson={() =>
              setActiveLesson({ ...lesson, status: "ACTIVE" })
            }
          />
        </div>
      ))}
      {lessons.length === 0 && (
        <p className="text-center text-muted-foreground">
          No lessons available for your current mastery level.
        </p>
      )}
    </div>
  );
}
