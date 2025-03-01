"use client";

import { Button } from "@/components/ui/button";
import type { Concept } from "@/core/concept/types";
import { MasteryLevel } from "@/core/goal/types";
import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import Link from "next/link";
import { LessonComponent } from "./LessonComponent";
import { MasteryLevelExplanation } from "./MasteryLevelExplanation";

export function ConceptView({ concept }: { concept: Concept }) {
  const { data: video, isLoading } =
    api.learning.searchEducationalVideo.useQuery(
      concept.masteryLevel !== "UNKNOWN"
        ? {
            conceptId: concept.id,
          }
        : skipToken,
    );

  if (concept.masteryLevel === MasteryLevel.Enum.UNKNOWN) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between gap-4">
          <MasteryLevelExplanation masteryLevel={concept.masteryLevel} />
          <Button asChild>
            <Link href={`/concept/${concept.id}/quiz`}>Begin Assessment</Link>
          </Button>
        </div>
        <LessonComponent conceptId={concept.id} />
      </>
    );
  }
  // @TODO have this component be Agent controlled.
  // Should the student watch a video, do an exercise or is he ready for another assessment?
  // Maybe exercises are done as an assessment... masteryLevel goes up independently.

  return (
    <div className="mt-6 space-y-8">
      <MasteryLevelExplanation masteryLevel={concept.masteryLevel} />
      {/* <VideoCard video={video} isLoading={isLoading} /> */}

      <LessonComponent conceptId={concept.id} />
    </div>
  );
}
