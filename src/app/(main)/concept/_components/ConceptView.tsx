"use client";

import { Button } from "@/components/ui/button";
import type { Concept } from "@/core/goal/types";
import Link from "next/link";
import { MasteryLevelPill } from "./MasteryLevelPill";

export function ConceptView({ concept }: { concept: Concept }) {
  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <h2 className="text-2xl font-semibold">{concept.name}</h2>
        <MasteryLevelPill level={concept.masteryLevel} />
        {concept.masteryLevel === "UNKNOWN" && (
          <Button asChild>
            <Link href={`/concept/${concept.id}/quiz`}>Begin Assessment</Link>
          </Button>
        )}
      </div>

      <p className="mt-4 text-base">{concept.description}</p>
    </>
  );
}
