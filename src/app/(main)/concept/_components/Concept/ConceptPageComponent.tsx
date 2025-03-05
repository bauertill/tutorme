"use client";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { ConceptHeader } from "../ConceptHeader";
import { ConceptView } from "../ConceptView";
import { SelfAssessment } from "../SelfAssessment";

export function ConceptPageComponent({ conceptId }: { conceptId: string }) {
  const { data: concept } = api.concept.byId.useQuery(conceptId);
  const [learningMode, setLearningMode] = useState<
    "lesson" | "video" | undefined
  >();

  const masteryLevel = concept?.masteryLevel;
  useEffect(() => {
    if (masteryLevel === "BEGINNER") {
      setLearningMode("video");
    } else if (masteryLevel === "INTERMEDIATE" || masteryLevel === "ADVANCED") {
      setLearningMode("lesson");
    }
  }, [masteryLevel]);

  if (!concept) return null;
  return (
    <div className="mx-auto max-w-screen-md">
      <main className="space-y-6">
        <ConceptHeader
          concept={concept}
          learningMode={learningMode}
          setLearningMode={setLearningMode}
        />
        <p className="text-muted-foreground">{concept.description}</p>
        <ConceptView
          conceptId={conceptId}
          learningMode={learningMode}
          setLearningMode={setLearningMode}
        />
        {masteryLevel === "UNKNOWN" && <SelfAssessment concept={concept} />}
      </main>
    </div>
  );
}
