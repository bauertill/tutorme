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
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LessonComponent({ conceptId }: { conceptId: string }) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query to get lessons for this concept
  const {
    data: lessons,
    isLoading,
    refetch,
  } = api.learning.getLessonsByConceptId.useQuery({
    conceptId,
  });

  // Mutation to create a new lesson
  const createLessonMutation = api.learning.createLesson.useMutation({
    onSuccess: () => {
      setIsCreating(false);
      refetch();
      router.refresh();
    },
    onError: (error) => {
      console.error("Error creating lesson:", error);
      setIsCreating(false);
    },
  });

  // Mutation to submit a lesson response
  const submitResponseMutation = api.learning.submitLessonResponse.useMutation({
    onSuccess: () => {
      setUserInput("");
      setIsSubmitting(false);
      setActiveLesson(null);
      refetch();
      router.refresh();
    },
    onError: (error) => {
      console.error("Error submitting response:", error);
      setIsSubmitting(false);
    },
  });

  const handleCreateLesson = () => {
    setIsCreating(true);
    createLessonMutation.mutate({ conceptId });
  };

  const handleContinueLesson = (lessonId: string) => {
    setActiveLesson(lessonId);
  };

  const handleSubmitResponse = (lessonId: string) => {
    if (!userInput.trim()) return;

    setIsSubmitting(true);
    submitResponseMutation.mutate({
      lessonId,
      userInput: userInput.trim(),
    });
  };

  if (isLoading) {
    return <div className="mt-6 text-center">Loading lessons...</div>;
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Lessons</h3>
        <Button onClick={handleCreateLesson} disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Lesson"}
        </Button>
      </div>

      {lessons && lessons.length > 0 ? (
        <div className="space-y-4">
          {lessons.map((lesson) => (
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
                        <p className="mb-1 text-sm font-semibold">
                          Evaluation:
                        </p>
                        <p className="whitespace-pre-wrap">
                          {iteration.evaluation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {activeLesson === lesson.id && lesson.status !== "DONE" && (
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
                        onClick={() => setActiveLesson(null)}
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
                {lesson.status !== "DONE" && activeLesson !== lesson.id && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleContinueLesson(lesson.id)}
                  >
                    Continue Lesson
                  </Button>
                )}
                {lesson.status === "DONE" && (
                  <div className="w-full text-center font-medium text-green-600">
                    Lesson Complete! Goal Achieved.
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p>No lessons found. Create your first lesson to start learning!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
