"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import Link from "next/link";
import { MasteryLevelPill } from "./MasteryLevelPill";

export default function ConceptsList({ goalId }: { goalId: string }) {
  const {
    data: concepts,
    isPending,
    isError,
  } = api.goal.getConcepts.useQuery(goalId);

  if (isError) {
    return <div>Error loading concepts</div>;
  }

  return (
    <div className="space-y-4">
      {isPending
        ? Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
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
          ))
        : concepts.map((concept) => (
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
    </div>
  );
}
