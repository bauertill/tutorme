"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MasteryLevel } from "@/core/goal/types";
import { api } from "@/trpc/react";
import { BookOpenIcon, VideoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { LessonController } from "./Lesson/LessonController";
import { SelfAssessment } from "./SelfAssessment";
import { VideoController } from "./Video/VideoCard";

export function ConceptView({ conceptId }: { conceptId: string }) {
  const { data: concept } = api.concept.byId.useQuery(conceptId);
  const [learningMode, setLearningMode] = useState<
    "lesson" | "video" | undefined
  >();
  useEffect(() => {
    if (concept?.masteryLevel === MasteryLevel.Enum.BEGINNER) {
      setLearningMode("video");
    }
  }, [concept]);

  if (!concept) return null;
  if (concept.masteryLevel === "UNKNOWN")
    return <SelfAssessment concept={concept} />;

  return (
    <div className="mt-8 space-y-8">
      <div className="flex justify-center">
        <ToggleGroup
          type="single"
          value={learningMode}
          onValueChange={(value: string | undefined) =>
            setLearningMode(value as "video" | "lesson")
          }
          className="flex gap-4"
        >
          <ToggleGroupItem
            value="video"
            aria-label="Toggle video mode"
            className="flex items-center gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <VideoIcon className="h-4 w-4" />
            <span>Video</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="lesson"
            aria-label="Toggle lesson mode"
            className="flex items-center gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <BookOpenIcon className="h-4 w-4" />
            <span>Lesson</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      {learningMode === "video" && (
        <VideoController
          conceptId={conceptId}
          onVideoComplete={() => setLearningMode("lesson")}
        />
      )}
      {learningMode === "lesson" && <LessonController conceptId={conceptId} />}
    </div>
  );
}
