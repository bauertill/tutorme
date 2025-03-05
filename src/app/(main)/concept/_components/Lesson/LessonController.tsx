"use client";

// import { skipToken } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { type Lesson } from "@/core/lesson/types";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { ActiveLessonComponent } from "./ActiveLessonComponent";
import { LessonList } from "./LessonList";
import { LessonSkeleton } from "./LessonSkeleton";

export function LessonController({ conceptId }: { conceptId: string }) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const { data: concept } = api.concept.byId.useQuery(conceptId);

  const {
    mutate: createLessonsForConcept,
    isPending: isCreatingLessons,
    data: newLessons,
  } = api.learning.createLessonsForConcept.useMutation({});
  // Mutation to submit a lesson response
  const { mutate: submitResponse, isPending: isSubmitting } =
    api.learning.submitLessonResponse.useMutation({
      onSuccess: (lesson) => {
        setActiveLesson(lesson);
      },
      onError: (error) => {
        console.error("Error submitting response:", error);
      },
    });

  const {
    data: existingLessons,
    refetch: refetchLessons,
    isSuccess: existingLessonsSuccess,
    isLoading: isFetchingLessons,
  } = api.learning.getLessonsByConceptId.useQuery({
    conceptId,
  });

  // If there are no lessons, create them in bulk and save :D
  useEffect(() => {
    if (existingLessonsSuccess && existingLessons?.length === 0) {
      console.log("Creating lessons for concept");
      createLessonsForConcept({ conceptId });
    }
  }, [
    existingLessons,
    existingLessonsSuccess,
    conceptId,
    createLessonsForConcept,
  ]);

  const lessons: Lesson[] = existingLessons?.length
    ? existingLessons
    : (newLessons ?? []);

  // Filter lessons based on user's mastery level
  const currentMasteryLevel = concept?.masteryLevel ?? "BEGINNER";
  const filteredLessons = lessons.filter(
    (lesson) => lesson.difficulty === currentMasteryLevel,
  );

  // Calculate progress
  const completedLessons = filteredLessons.filter((l) =>
    l.status.includes("DONE"),
  ).length;
  const totalLessons = filteredLessons.length;
  const progress =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Get next mastery level
  const masteryLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
  const currentLevelIndex = masteryLevels.indexOf(currentMasteryLevel);
  const nextLevel =
    currentLevelIndex < masteryLevels.length - 1
      ? masteryLevels[currentLevelIndex + 1]
      : null;

  if (isFetchingLessons || isCreatingLessons) {
    return <LessonSkeleton />;
  }
  const nextLesson = filteredLessons.find(
    (l) => !l.status.includes("DONE") && l.id !== activeLesson?.id,
  );
  const goToNextLesson = nextLesson
    ? () => setActiveLesson(nextLesson)
    : undefined;

  return (
    <div className="mt-6 space-y-8">
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {currentMasteryLevel.charAt(0) +
                  currentMasteryLevel.slice(1).toLowerCase()}{" "}
                Level Lessons
              </h3>
              {nextLevel && (
                <span className="text-sm text-muted-foreground">
                  Progress to{" "}
                  {nextLevel.charAt(0) + nextLevel.slice(1).toLowerCase()}
                </span>
              )}
            </div>
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {completedLessons} of {totalLessons} lessons completed
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeLesson ? (
            <ActiveLessonComponent
              lesson={activeLesson}
              handleUserResponse={(userInput, lessonId) =>
                submitResponse({ lessonId, userInput })
              }
              isSubmitting={isSubmitting}
              goBack={async () => {
                setActiveLesson(null);
                await refetchLessons();
              }}
              goToNextLesson={goToNextLesson}
            />
          ) : (
            <LessonList
              lessons={filteredLessons}
              setActiveLesson={setActiveLesson}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
