"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { Target } from "lucide-react";

export function ConceptsList() {
  const {
    data: concepts,
    isLoading,
    error,
  } = api.studentContext.getConceptsForStudent.useQuery();

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

  const getDifficultyColor = (
    skillLevel: "unknown" | "1" | "2" | "3" | "4" | "5",
  ) => {
    switch (skillLevel) {
      case "1":
      case "2":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "3":
      case "4":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "5":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
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
    if (topicLower.includes("equation")) return "🟰";
    return "📚";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Year-End Learning Goals
        </CardTitle>
        <div className="space-y-2"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {concepts.map((concept, index) => (
            <div
              key={index}
              className="rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getTopicIcon(concept.concept.name)}
                    </span>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {concept.concept.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getDifficultyColor(concept.skillLevel)}`}
                    >
                      {concept.skillLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {concept.concept.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
