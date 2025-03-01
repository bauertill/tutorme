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
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LessonComponent({ conceptId }: { conceptId: string }) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCreateLesson = () => {
    setIsCreating(true);
    createLessonMutation.mutate({ conceptId });
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
                      <div key={turnIdx} className="rounded bg-muted p-3">
                        <p className="mb-1 text-sm font-semibold capitalize">
                          {turn.type}:
                        </p>
                        <p className="whitespace-pre-wrap">{turn.text}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Continue Lesson
                </Button>
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
