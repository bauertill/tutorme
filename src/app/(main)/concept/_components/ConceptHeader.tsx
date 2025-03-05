"use client";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Concept } from "@/core/concept/types";
import { BookOpenIcon, ChevronLeft, VideoIcon } from "lucide-react";
import { MasteryLevelPill } from "./MasteryLevelPill";

export function ConceptHeader({
  concept,
  learningMode,
  setLearningMode,
}: {
  concept: Concept;
  learningMode?: "video" | "lesson";
  setLearningMode: (learningMode: "video" | "lesson") => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="flex items-center space-x-2 text-3xl font-bold text-foreground">
          {concept.name}
        </h1>
        <MasteryLevelPill level={concept.masteryLevel} />
      </div>
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
    </div>
  );
}
