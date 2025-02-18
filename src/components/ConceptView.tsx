"use client";

import { ConceptWithGoal } from "@/core/goal/types";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Question } from "@/core/concept/types";
import { QuizView } from "./QuizView";
import { useState } from "react";

// Create fetch functions (can be moved to a separate api.ts file)
const fetchConcept = async (conceptId: string): Promise<ConceptWithGoal> => {
  const response = await fetch(`/api/concept/${conceptId}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const generateQuiz = async (conceptId: string) => {
  const response = await fetch(`/api/concept/${conceptId}/quiz`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to generate quiz");
  }
  return response.json();
};

export function ConceptView({ conceptId }: { conceptId: string }) {
  const [quiz, setQuiz] = useState<{ questions: Question[] } | null>(null);

  const {
    data: concept,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["concept", conceptId],
    queryFn: () => fetchConcept(conceptId),
  });

  const generateQuizMutation = useMutation({
    mutationFn: generateQuiz,
    onSuccess: data => {
      setQuiz(data);
    },
  });

  const handleQuizComplete = (
    results: { questionIndex: number; answer: string }[]
  ) => {
    // TODO: Send results to backend to update mastery level
    console.log("Quiz completed:", results);
    setQuiz(null);
  };

  // Handle loading and error states in your JSX
  if (isLoading) return <div>Loading concept...</div>;
  if (error) return <div>Error loading concept</div>;

  if (!concept) {
    return <div>Loading...</div>;
  }

  if (quiz) {
    return (
      <QuizView questions={quiz.questions} onComplete={handleQuizComplete} />
    );
  }

  return (
    <main>
      <div className="p-4">
        {/* Goal heading */}
        <h1 className="text-4xl font-bold mb-6">{concept.goal.goal}</h1>

        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-2xl font-semibold">{concept.name}</h2>
          <span className="px-3 py-1 bg-gray-600 text-white rounded-full text-base">
            Skill Level: {concept.masteryLevel}
          </span>
          {concept.masteryLevel === "unknown" && (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={() => generateQuizMutation.mutate(conceptId)}
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
