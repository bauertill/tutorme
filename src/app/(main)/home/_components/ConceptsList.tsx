"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { BookOpen, Target, TrendingUp } from "lucide-react";

export function ConceptsList() {
  const {
    data: concepts,
    isLoading,
    error,
  } = api.studentContext.getYearEndConcepts.useQuery();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Year-End Learning Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Year-End Learning Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Unable to load learning goals. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!concepts) {
    return null;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "foundational":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTopicIcon = (topic: string) => {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes("algebra")) return "🔢";
    if (topicLower.includes("geometry")) return "📐";
    if (topicLower.includes("statistics") || topicLower.includes("probability"))
      return "📊";
    if (topicLower.includes("calculus")) return "∫";
    if (topicLower.includes("trigonometry")) return "📈";
    return "📚";
  };

  // Calculate progress (for demo purposes, using a simple calculation)
  const totalConcepts = concepts.concepts.length;
  const completedConcepts = Math.floor(totalConcepts * 0.3); // Simulate 30% completion
  const progressPercentage = (completedConcepts / totalConcepts) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Year-End Learning Goals
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {concepts.academicYear}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {completedConcepts} of {totalConcepts} concepts
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {concepts.concepts.slice(0, 6).map((concept, index) => (
            <div
              key={index}
              className="rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getTopicIcon(concept.topic)}
                    </span>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {concept.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getDifficultyColor(concept.difficulty)}`}
                    >
                      {concept.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {concept.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="h-3 w-3" />
                    <span>{concept.topic}</span>
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  {index < completedConcepts ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-400">○</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {concepts.concepts.length > 6 && (
            <div className="pt-2 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                View all {concepts.concepts.length} concepts
                <TrendingUp className="ml-1 inline h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
