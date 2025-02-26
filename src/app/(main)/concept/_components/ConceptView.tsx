"use client";

import { Button } from "@/components/ui/button";
import type { Concept } from "@/core/goal/types";
import { api } from "@/trpc/react";
import Link from "next/link";
import { MasteryLevelExplanation } from "./MasteryLevelExplanation";
import { MasteryLevelPill } from "./MasteryLevelPill";
import { VideoList } from "./VideoList";

export function ConceptView({ concept }: { concept: Concept }) {
  const { data: videos, isLoading } =
    api.learning.searchEducationalVideos.useQuery({
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

  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <MasteryLevelPill level={concept.masteryLevel} />
      </div>

      <p className="mt-4 text-base">{concept.description}</p>

      <div className="mt-6">
        <h3 className="mb-4 text-xl font-medium">Educational Videos</h3>
        <VideoList videos={videos || []} isLoading={isLoading} />
      </div>
    </>
  );
}
