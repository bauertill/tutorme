"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Lesson } from "@/core/learning/types";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LessonComponent({ conceptId }: { conceptId: string }) {
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const submitResponseMutation = api.learning.submitLessonResponse.useMutation({
    onSuccess: (lesson) => {
      setUserInput("");
      setLesson(lesson);
    },
    onError: (error) => {
      console.error("Error submitting response:", error);
      setIsSubmitting(false);
    },
  });

  const handleSubmitResponse = (lessonId: string) => {
    if (!userInput.trim()) return;

    setIsSubmitting(true);
    submitResponseMutation.mutate({
      lessonId,
      userInput: userInput.trim(),
    });
  };

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
          <CardDescription>Status: {lesson.status}</CardDescription>
        </CardHeader>
        <CardContent>
          {lesson.lessonIterations.map((iteration, idx) => (
            <div key={idx} className="mb-4 space-y-3 border-b pb-4">
              <h4 className="font-medium">Iteration {idx + 1}</h4>
              {iteration.turns.map((turn, turnIdx) => (
                <div key={turnIdx} className="my-2 rounded bg-muted p-3">
                  <p className="mb-1 text-sm font-semibold capitalize">
                    {turn.type}:
                  </p>
                  <p className="whitespace-pre-wrap">{turn.text}</p>
                </div>
              ))}
              {iteration.evaluation && (
                <div className="my-2 rounded border-l-4 border-primary bg-muted p-3">
                  <p className="mb-1 text-sm font-semibold">Evaluation:</p>
                  <p className="whitespace-pre-wrap">{iteration.evaluation}</p>
                </div>
              )}
            </div>
          ))}

          {lesson.status !== "DONE" && (
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
        <CardFooter>
          {lesson.status === "DONE" && (
            <div className="w-full text-center font-medium text-green-600">
              <h4>Congratulations! You've completed the lesson.</h4>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => createLesson({ conceptId })}
              >
                Next Lesson
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
