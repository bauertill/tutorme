"use client";

import { Quiz } from "@/core/concept/types";
import { api } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { MasteryLevelPill } from "./MasteryLevelPill";
import { QuizView } from "./QuizView";

const updateConceptMasteryLevelApiRequest = async (payload: {
  conceptId: string;
  userId: string;
}) => {
  const response = await fetch(`/api/quiz`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return Quiz.parse(await response.json());
};

export function ConceptView({ conceptId }: { conceptId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const {
    data: concept,
    isLoading,
    error,
    refetch,
  } = api.concept.byId.useQuery(conceptId);

  const generateQuizMutation = api.quiz.generate.useMutation({
    onSuccess: (data) => {
      setQuiz(data);
    },
  });

  const { mutate: updateConceptMasteryLevel } = useMutation({
    mutationFn: updateConceptMasteryLevelApiRequest,
    onSuccess: (data) => {
      console.log("Concept mastery level updated:", data);
      void refetch();
    },
  });

  // Handle loading and error states in your JSX
  if (isLoading) return <div>Loading concept...</div>;
  if (error) return <div>Error loading concept</div>;

  if (!concept) {
    return <div>Loading...</div>;
  }

  if (quiz) {
    return (
      <QuizView
        questions={quiz.questions}
        quizId={quiz.id}
        userId={concept.goal.userId}
        conceptId={conceptId}
        onComplete={() => {
          updateConceptMasteryLevel({
            conceptId,
            userId: concept.goal.userId,
          });
          setQuiz(null);
        }}
      />
    );
  }

  return (
    <main>
      <div className="p-4">
        {/* Goal heading */}
        <h1 className="text-4xl font-bold mb-6">{concept.goal.name}</h1>

        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-2xl font-semibold">{concept.name}</h2>
          <MasteryLevelPill level={concept.masteryLevel} />
          {concept.masteryLevel === "UNKNOWN" && (
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

        <p className="mt-4 text-base">{concept.description}</p>
      </div>
    </main>
  );
}
