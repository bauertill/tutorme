"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Lesson } from "@/core/lesson/types";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { LessonExercise } from "./LessonExercise";
import { LessonExplanation } from "./LessonExplanation";
import { LessonSkeleton } from "./LessonSkeleton";

export function LessonComponent({ conceptId }: { conceptId: string }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [userInput, setUserInput] = useState("");

  // Mutation to create a new lesson
  const { mutate: createLesson, isPending: isCreating } =
    api.learning.createLesson.useMutation({
      onSuccess: (lesson) => {
        setLesson(lesson);
      },
      onError: (error) => {
        console.error("Error creating lesson:", error);
      },
    });

  // Mutation to submit a lesson response
  const { mutate: submitResponse, isPending: isSubmitting } =
    api.learning.submitLessonResponse.useMutation({
      onSuccess: (lesson) => {
        setUserInput("");
        setLesson(lesson);
      },
      onError: (error) => {
        console.error("Error submitting response:", error);
      },
    });

  const handleSubmitResponse = (lessonId: string) => {
    if (!userInput.trim()) return;
    submitResponse({
      lessonId,
      userInput: userInput.trim(),
    });
  };

  if (isCreating) {
    return <LessonSkeleton />;
  }

  if (!lesson) {
    return (
      <div className="mt-6 flex flex-row items-center justify-between gap-4">
        <h3 className="text-xl font-semibold">Lesson</h3>
        <Button
          onClick={() => createLesson({ conceptId })}
          disabled={isCreating}
        >
          {isCreating ? <Loader2 className="animate-spin" /> : "Create Lesson"}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between"></div>

      <Card key={lesson.id}>
        <CardHeader>
          <CardTitle>Lesson: {lesson.lessonGoal}</CardTitle>
        </CardHeader>
        <CardContent>
          {lesson.turns.map((turn, turnIdx) => {
            if (turn.type === "explanation") {
              return <LessonExplanation key={turnIdx} explanation={turn} />;
            }
            if (turn.type === "exercise") {
              return <LessonExercise key={turnIdx} exercise={turn} />;
            }
            return (
              <div key={turnIdx} className="my-2 rounded bg-muted p-3">
                <p className="whitespace-pre-wrap">{turn.text}</p>
              </div>
            );
          })}

          {lesson.status === "ACTIVE" && (
            <div className="mt-4 space-y-3">
              <h4 className="font-medium">Your Response</h4>
              <Textarea
                placeholder="Type your response to the exercise..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={6}
                className="w-full"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setLesson(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSubmitResponse(lesson.id)}
                  disabled={isSubmitting || !userInput.trim()}
                >
                  {isSubmitting ? "Submitting..." : "Submit Response"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        {/* @TODO add give up button */}
        <CardFooter>
          {lesson.status !== "ACTIVE" && (
            <div className="flex w-full justify-between gap-2 text-center font-medium">
              <h4>Congratulations! You&apos;ve completed the lesson.</h4>
              <Button
                onClick={() => createLesson({ conceptId })}
                disabled={isCreating}
              >
                {isCreating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Next Lesson"
                )}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
