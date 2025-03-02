"use client";

import { MasteryLevel } from "@/core/goal/types";
// import { skipToken } from "@tanstack/react-query";
import { api } from "@/trpc/react";
import { LessonComponent } from "./Lesson/LessonComponent";
import { SelfAssessment } from "./SelfAssessment";

export function ConceptView({ conceptId }: { conceptId: string }) {
  const { data: concept } = api.concept.byId.useQuery(conceptId);
  if (!concept) return null;
  // const { data: video, isLoading } =
  //   api.learning.searchEducationalVideo.useQuery(
  //     concept.masteryLevel !== MasteryLevel.Enum.UNKNOWN
  //       ? { conceptId: concept.id }
  //       : skipToken,
  //   );

  if (concept.masteryLevel === MasteryLevel.Enum.UNKNOWN) {
    return <SelfAssessment concept={concept} />;
  }

  return (
    <div className="mt-6 space-y-8">
      <p>
        {concept.masteryLevel === MasteryLevel.Enum.BEGINNER &&
          "You're at the beginning of your journey."}
        {concept.masteryLevel === MasteryLevel.Enum.INTERMEDIATE &&
          "You're making progress and understand some basics. Let's focus on the complex questions to master this concept."}
        {concept.masteryLevel === MasteryLevel.Enum.ADVANCED &&
          "You're starting to master the complicated questions, with some practice you will be an expert soon."}
        {concept.masteryLevel === MasteryLevel.Enum.EXPERT &&
          "You're officially an expert on this topic!"}
      </p>
      {/* <VideoCard video={video} isLoading={isLoading} /> */}

      <LessonComponent conceptId={concept.id} />
    </div>
  );
}
