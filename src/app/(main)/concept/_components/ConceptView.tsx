"use client";

import { MasteryLevel } from "@/core/goal/types";
// import { skipToken } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Lesson } from "@/core/lesson/types";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ActiveLessonComponent } from "./Lesson/ActiveLessonComponent";
import { LessonListComponent } from "./Lesson/LessonListComponent";
import { SelfAssessment } from "./SelfAssessment";

export function ConceptView({ conceptId }: { conceptId: string }) {
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

  if (!concept) return null;

  const { data: lessons, refetch: refetchLessons } =
    api.learning.getLessonsByConceptId.useQuery({
      conceptId,
    });

  if (concept.masteryLevel === MasteryLevel.Enum.UNKNOWN) {
    return <SelfAssessment concept={concept} />;
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
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle>Your Learning Path</CardTitle>
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
                {index > 0 && <Separator className="my-4" />}
                <LessonListComponent
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

function getFallbackText(masteryLevel: MasteryLevel) {
  switch (masteryLevel) {
    case MasteryLevel.Enum.BEGINNER:
      return "You're at the beginning of your journey.";
    case MasteryLevel.Enum.INTERMEDIATE:
      return "You're making progress and understand some basics. Let's focus on the complex questions to master this concept.";
    case MasteryLevel.Enum.ADVANCED:
      return "You're starting to master the complicated questions, with some practice you will be an expert soon.";
    case MasteryLevel.Enum.EXPERT:
      return "You're officially an expert on this topic!";
  }
}
