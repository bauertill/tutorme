"use client";

import { Button } from "@/components/ui/button";
import type { Concept } from "@/core/concept/types";
import { MasteryLevel } from "@/core/goal/types";
import { api } from "@/trpc/react";
// import { skipToken } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LessonComponent } from "./Lesson/LessonComponent";

export function ConceptView({ concept }: { concept: Concept }) {
  const router = useRouter();
  // const { data: video, isLoading } =
  //   api.learning.searchEducationalVideo.useQuery(
  //     concept.masteryLevel !== MasteryLevel.Enum.UNKNOWN
  //       ? { conceptId: concept.id }
  //       : skipToken,
  //   );

  const updateMasteryLevel = api.concept.updateMasteryLevel.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const onKnowsNothing = () => {
    updateMasteryLevel.mutate({
      conceptId: concept.id,
      masteryLevel: MasteryLevel.Enum.BEGINNER,
    });
  };

  const onKnowsSome = () => {
    updateMasteryLevel.mutate({
      conceptId: concept.id,
      masteryLevel: MasteryLevel.Enum.INTERMEDIATE,
    });
  };

  const onKnowsAll = () => {
    updateMasteryLevel.mutate({
      conceptId: concept.id,
      masteryLevel: MasteryLevel.Enum.EXPERT,
    });
  };

  if (concept.masteryLevel === MasteryLevel.Enum.UNKNOWN) {
    return (
      <div className="space-y-4">
        <p>
          Tell us how much you know about <i>{concept.name}</i>.
        </p>
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={onKnowsNothing}
            disabled={updateMasteryLevel.isPending}
          >
            I know nothing
          </Button>
          <Button
            variant="outline"
            onClick={onKnowsSome}
            disabled={updateMasteryLevel.isPending}
          >
            I know some things
          </Button>
          <Button
            variant="outline"
            onClick={onKnowsAll}
            disabled={updateMasteryLevel.isPending}
          >
            I know all
          </Button>
        </div>
        {updateMasteryLevel.isPending && (
          <p className="text-center">Please wait...</p>
        )}
        <LessonComponent conceptId={concept.id} />
      </div>
    );
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
