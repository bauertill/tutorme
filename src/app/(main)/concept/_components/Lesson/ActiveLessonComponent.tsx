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
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { LessonExercise } from "./LessonExercise";
import { LessonExplanation } from "./LessonExplanation";

export function ActiveLessonComponent({
  lesson,
  handleUserResponse,
  isSubmitting,
  goBack,
  goToNextLesson,
}: {
  lesson: Lesson;
  handleUserResponse: (userInput: string, lessonId: string) => void;
  isSubmitting: boolean;
  goBack: () => void;
  goToNextLesson?: () => void;
}) {
  const [userInput, setUserInput] = useState("");

  const handleSubmitResponse = (lessonId: string) => {
    handleUserResponse(userInput, lessonId);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={goBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card key={lesson.id}>
        <CardHeader>
          {/* @TODO add lesson number */}
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
                  onClick={goBack}
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
          {lesson.status.includes("DONE") && (
            <div className="flex w-full justify-between gap-2 text-center font-medium">
              <h4>Congratulations! You&apos;ve completed the lesson.</h4>
              <Button onClick={goToNextLesson ?? goBack}>
                {goToNextLesson ? "Next Lesson" : "Back to Lessons"}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
