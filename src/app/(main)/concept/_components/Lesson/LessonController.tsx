"use client";

// import { skipToken } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Lesson } from "@/core/lesson/types";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { ActiveLessonComponent } from "./ActiveLessonComponent";
import { LessonListItem } from "./LessonListItem";
import { LessonSkeleton } from "./LessonSkeleton";

export function LessonController({ conceptId }: { conceptId: string }) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

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

  if (isFetchingLessons || isCreatingLessons) {
    return <LessonSkeleton />;
  }

  if (activeLesson) {
    return (
      <ActiveLessonComponent
        lesson={activeLesson}
        handleUserResponse={(userInput, lessonId) =>
          submitResponse({ lessonId, userInput })
        }
        isSubmitting={isSubmitting}
        goBack={() => {
          refetchLessons();
          setActiveLesson(null);
        }}
      />
    );
  }

  return (
    <div className="mt-6 space-y-8">
      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          <div className="space-y-6">
            {lessons?.map((lesson, index) => (
              <div key={lesson.id}>
                <LessonListItem
                  lesson={lesson}
                  setActiveLesson={setActiveLesson}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
