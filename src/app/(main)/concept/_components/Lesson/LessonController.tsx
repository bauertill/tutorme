"use client";

// import { skipToken } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lesson } from "@/core/lesson/types";
import { api } from "@/trpc/react";
import { Search, SortAsc } from "lucide-react";
import { useEffect, useState } from "react";
import { ActiveLessonComponent } from "./ActiveLessonComponent";
import { LessonListItem } from "./LessonListItem";
import { LessonSkeleton } from "./LessonSkeleton";

export function LessonController({ conceptId }: { conceptId: string }) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"difficulty" | "status">("difficulty");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  const filteredAndSortedLessons = lessons
    ?.filter((lesson) =>
      lesson.lessonGoal.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "difficulty") {
        const difficultyOrder = {
          BEGINNER: 1,
          INTERMEDIATE: 2,
          ADVANCED: 3,
          EXPERT: 4,
        };
        const comparison =
          difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        return sortOrder === "asc" ? comparison : -comparison;
      } else {
        // Sort by status
        const statusOrder = {
          ACTIVE: 1,
          TODO: 2,
          DONE: 3,
          DONE_WITH_HELP: 4,
          PAUSED: 5,
        };
        const comparison = statusOrder[a.status] - statusOrder[b.status];
        return sortOrder === "asc" ? comparison : -comparison;
      }
    });

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
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lessons..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy("difficulty")}
                className={sortBy === "difficulty" ? "bg-accent" : ""}
              >
                Sort by Difficulty
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy("status")}
                className={sortBy === "status" ? "bg-accent" : ""}
              >
                Sort by Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                <SortAsc
                  className={`h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredAndSortedLessons?.map((lesson, index) => (
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
