"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type Concept } from "@/core/concept/types";
import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { sortBy, unionBy } from "lodash-es";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { MasteryLevelPill } from "./MasteryLevelPill";

export default function ConceptsList({ goalId }: { goalId: string }) {
  const utils = api.useUtils();
  const { data: goalWithConcepts, isError } =
    api.goal.byIdIncludeConcepts.useQuery(goalId);

  const isCompletelyGenerated =
    goalWithConcepts?.generationStatus === "COMPLETED";

  const [generatedConcepts, setGeneratedConcepts] = useState<Concept[]>([]);
  const concepts = sortBy(
    unionBy(goalWithConcepts?.concepts ?? [], generatedConcepts, (x) => x.id),
    (x) => x.createdAt,
  );

  api.goal.onConceptGenerated.useSubscription(
    isCompletelyGenerated ? skipToken : { goalId },
    {
      onData: (data) => {
        setGeneratedConcepts((prev) => [...prev, data]);
      },
      onComplete: () => {
        void utils.goal.byIdIncludeConcepts.invalidate(goalId);
      },
      onError: (error) => {
        console.error(error);
        toast.error("Error generating goal concepts");
      },
    },
  );

  if (isError) {
    return <div>Error loading concepts</div>;
  }

  return (
    <div className="space-y-4">
      {concepts.map((concept) => (
        <Link
          key={concept.id}
          href={`/concept/${concept.id}`}
          className="block"
        >
          <Card className="transition-colors">
            <CardContent className="pt-6">
              <h3 className="flex items-start justify-between text-lg font-semibold">
                {concept.name}
                <MasteryLevelPill level={concept.masteryLevel} />
              </h3>
              <p className="mt-2">{concept.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
      {!isCompletelyGenerated && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="w-full">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
