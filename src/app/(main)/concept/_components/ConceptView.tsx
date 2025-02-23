"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type Quiz } from "@/core/concept/types";
import { api } from "@/trpc/react";
import { useState } from "react";
import { MasteryLevelPill } from "./MasteryLevelPill";
import { QuizView } from "./QuizView";

export function ConceptView({ conceptId }: { conceptId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const {
    data: concept,
    isPending,
    error,
    refetch,
  } = api.concept.byId.useQuery(conceptId);

  const generateQuizMutation = api.quiz.generate.useMutation({
    onSuccess: (data) => {
      setQuiz(data);
    },
  });

  const updateConceptMasteryLevel =
    api.quiz.updateConceptMasteryLevel.useMutation({
      onSuccess: () => void refetch(),
    });

  if (quiz) {
    return (
      <QuizView
        questions={quiz.questions}
        quizId={quiz.id}
        conceptId={conceptId}
        onComplete={() => {
          updateConceptMasteryLevel.mutate({ conceptId });
          setQuiz(null);
        }}
      />
    );
  }

  if (error) return <div>Error loading concept</div>;

  return (
    <main>
      <div className="p-4">
        {isPending ? (
          <>
            <Skeleton className="mb-6 h-8 w-64" />
            <div className="mb-4 flex items-center gap-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-20 w-full" />
          </>
        ) : (
          <>
            <h1 className="mb-6 text-4xl font-bold">{concept.goal.name}</h1>

            <div className="mb-4 flex items-center gap-4">
              <h2 className="text-2xl font-semibold">{concept.name}</h2>
              <MasteryLevelPill level={concept.masteryLevel} />
              {concept.masteryLevel === "UNKNOWN" && (
                <Button
                  onClick={() => generateQuizMutation.mutate({ conceptId })}
                  disabled={generateQuizMutation.isPending}
                >
                  {generateQuizMutation.isPending
                    ? "Generating Quiz..."
                    : "Begin Assessment"}
                </Button>
              )}
            </div>

            <p className="mt-4 text-base">{concept.description}</p>
          </>
        )}
      </div>
    </main>
  );
}
