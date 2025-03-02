"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Concept } from "@/core/concept/types";
import { MasteryLevel } from "@/core/goal/types";
import { api } from "@/trpc/react";

function SelfAssessmentCard({
  concept,
  masteryLevel,
}: {
  concept: Concept;
  masteryLevel: MasteryLevel;
}) {
  const utils = api.useUtils();
  const updateMasteryLevel = api.concept.updateMasteryLevel.useMutation({
    onSuccess: async () => {
      await utils.concept.byId.invalidate(concept.id);
      void utils.goal.getConcepts.invalidate();
    },
  });
  const onClick = () => {
    updateMasteryLevel.mutate({
      conceptId: concept.id,
      masteryLevel: masteryLevel,
    });
  };

  return (
    <Card
      className="hover:bg-accent-hover w-full text-accent-foreground hover:cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle>{masteryLevel}</CardTitle>
      </CardHeader>
      <CardContent>
        {masteryLevel === MasteryLevel.Enum.BEGINNER &&
          "Choose this if you're completely new to the subject."}
        {masteryLevel === MasteryLevel.Enum.INTERMEDIATE &&
          "Choose this if you have learned some things about the subject, but haven't mastered it yet."}
        {masteryLevel === MasteryLevel.Enum.EXPERT &&
          "Choose this if you have mastered the subject."}
      </CardContent>
    </Card>
  );
}

export function SelfAssessment({ concept }: { concept: Concept }) {
  return (
    <div className="space-y-4">
      <p>
        Tell us how much you know about <i>{concept.name}</i>.
      </p>
      <div className="space-y-4">
        <SelfAssessmentCard
          concept={concept}
          masteryLevel={MasteryLevel.Enum.BEGINNER}
        />
        <SelfAssessmentCard
          concept={concept}
          masteryLevel={MasteryLevel.Enum.INTERMEDIATE}
        />
        <SelfAssessmentCard
          concept={concept}
          masteryLevel={MasteryLevel.Enum.EXPERT}
        />
      </div>
    </div>
  );
}
