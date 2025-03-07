import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type Lesson } from "@/core/lesson/types";
import { LessonListItem, LessonListItemSkeleton } from "./LessonListItem";

export function LessonList({
  lessons,
  setActiveLesson,
  isGeneratingLessons,
}: {
  lessons: Lesson[];
  setActiveLesson: (lesson: Lesson) => void;
  isGeneratingLessons: boolean;
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
      {!isGeneratingLessons && lessons.length === 0 && (
        <p className="text-center text-muted-foreground">
          No lessons available for your current mastery level.
        </p>
      )}
      {isGeneratingLessons && <LessonListItemSkeleton />}
    </div>
  );
}

export function LessonListSkeleton() {
  return (
    <Card className="">
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              <Skeleton className="h-6 w-40" />
            </h3>
            <span className="text-sm text-muted-foreground">
              <Skeleton className="h-4 w-32" />
            </span>
          </div>
          <div className="space-y-1">
            <Skeleton className="h-2 w-full" />
            <div className="text-sm text-muted-foreground">
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <LessonListItemSkeleton />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
