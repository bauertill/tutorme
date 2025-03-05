"use client";

import { Concept } from "@/core/concept/types";
import { LessonController } from "./Lesson/LessonController";
import { VideoController } from "./Video/VideoCard";

export function ConceptView({
  concept,
  learningMode,
  setLearningMode,
}: {
  concept: Concept;
  learningMode: "video" | "lesson";
  setLearningMode: (learningMode: "video" | "lesson") => void;
}) {
  if (!concept) return null;

  return (
    <div className="mt-8 space-y-8">
      {learningMode === "video" && (
        <VideoController
          conceptId={concept.id}
          onVideoComplete={() => setLearningMode("lesson")}
        />
      )}
      {learningMode === "lesson" && <LessonController conceptId={concept.id} />}
    </div>
  );
}
