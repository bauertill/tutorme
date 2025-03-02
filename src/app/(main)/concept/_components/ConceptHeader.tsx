"use client";
import { api } from "@/trpc/react";
import { MasteryLevelPill } from "./MasteryLevelPill";

export function ConceptHeader({ conceptId }: { conceptId: string }) {
  const { data: concept } = api.concept.byId.useQuery(conceptId);
  if (!concept) return null;
  return (
    <h1 className="flex items-center justify-between text-3xl font-bold text-foreground">
      {concept.name}
      <MasteryLevelPill level={concept.masteryLevel} />
    </h1>
  );
}
