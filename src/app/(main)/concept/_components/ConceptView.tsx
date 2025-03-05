"use client";

import { LessonController } from "./Lesson/LessonController";
import { VideoController } from "./Video/VideoCard";

export function ConceptView({
  conceptId,
  learningMode,
  setLearningMode,
}: {
  conceptId: string;
  learningMode?: "video" | "lesson";
  setLearningMode: (learningMode: "video" | "lesson") => void;
}) {
  return (
    <div className="mt-8 space-y-8">
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
