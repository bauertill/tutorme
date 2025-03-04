"use client";

// import { skipToken } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Lesson } from "@/core/lesson/types";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ActiveLessonComponent } from "./ActiveLessonComponent";
import { LessonListItem } from "./LessonListItem";

export function LessonList({ conceptId }: { conceptId: string }) {
  const { data: concept } = api.concept.byId.useQuery(conceptId);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Mutation to create a new lesson
  const { mutate: createLesson, isPending: isCreating } =
    api.learning.createLesson.useMutation({
      onSuccess: (lesson) => {
        setActiveLesson(lesson);
      },
      onError: (error) => {
        console.error("Error creating lesson:", error);
      },
    });

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

  if (!concept) return null;

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
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <Button
              onClick={() => createLesson({ conceptId })}
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Create Lesson"
              )}
            </Button>
          </div>
        </CardHeader>
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
