"use client";
import { api } from "@/trpc/react";
import Link from "next/link";
import { MasteryLevelPill } from "./MasteryLevelPill";

export default function ConceptsList({ goalId }: { goalId: string }) {
  const { data: concepts, isLoading } = api.goal.getConcepts.useQuery(goalId);

  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-gray-900 rounded-lg shadow-md mb-4 animate-pulse"
          >
            <div className="flex justify-between items-start">
              <div className="w-full">
                <div className="h-6 bg-gray-800 rounded w-1/3"></div>
                <div className="h-4 bg-gray-800 rounded w-2/3 mt-2"></div>
              </div>
              <div className="h-6 bg-gray-800 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {concepts?.map((concept) => (
        <div
          key={concept.id}
          className="p-4 bg-gray-900 rounded-lg shadow-md mb-4 hover:bg-gray-800 transition-colors"
        >
          <Link href={`/concept/${concept.id}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-100">
                  {concept.name}
                </h3>
                <p className="text-gray-400 mt-2">{concept.description}</p>
              </div>
              <MasteryLevelPill level={concept.masteryLevel} />
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
