"use client";

import { Button } from "@/components/ui/button";
import type { Concept } from "@/core/goal/types";
import { api } from "@/trpc/react";
import Link from "next/link";
import { MasteryLevelExplanation } from "./MasteryLevelExplanation";
import { VideoCard } from "./VideoCard";

export function ConceptView({ concept }: { concept: Concept }) {
  const { data: video, isLoading } =
    api.learning.searchEducationalVideo.useQuery({
      conceptId: concept.id,
    });

  if (concept.masteryLevel === "UNKNOWN") {
    return (
      <>
        <div className="mb-4 flex items-center justify-between gap-4">
          <MasteryLevelExplanation masteryLevel={concept.masteryLevel} />
          <Button asChild>
            <Link href={`/concept/${concept.id}/quiz`}>Begin Assessment</Link>
          </Button>
        </div>
      </>
    );
  }
  // @TODO have this component be Agent controlled.
  // Should the student watch a video, do an exercise or is he ready for another assessment?
  // Maybe exercises are done as an assessment... masteryLevel goes up independently.

  return (
    <div className="mt-6 space-y-4">
      <MasteryLevelExplanation masteryLevel={concept.masteryLevel} />
      <VideoCard video={video} isLoading={isLoading} />
    </div>
  );
}
