"use client";

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
      onSuccess: () => {
        void refetch();
      },
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
            <div className="h-8 w-64 bg-gray-200 rounded mb-6 animate-pulse" />
            <div className="flex items-center gap-4 mb-4">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-6">{concept?.goal.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-2xl font-semibold">{concept?.name}</h2>
              <MasteryLevelPill level={concept?.masteryLevel} />
              {concept?.masteryLevel === "UNKNOWN" && (
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  onClick={() => generateQuizMutation.mutate({ conceptId })}
                  disabled={generateQuizMutation.isPending}
                >
                  {generateQuizMutation.isPending
                    ? "Generating Quiz..."
                    : "Begin Assessment"}
                </button>
              )}
            </div>

            <p className="mt-4 text-base">{concept?.description}</p>
          </>
        )}
      </div>
    </main>
  );
}
