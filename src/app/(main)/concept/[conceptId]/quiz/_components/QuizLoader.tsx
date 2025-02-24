"use client";

import { type Quiz } from "@/core/concept/types";
import type { Concept } from "@/core/goal/types";
import { api } from "@/trpc/react";
import { redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { QuizView } from "./QuizView";

export function QuizLoader({ concept }: { concept: Concept }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const hasMutated = useRef(false);

  const { mutate, isPending, isError } = api.quiz.generate.useMutation({
    onSuccess: (data) => {
      setQuiz(data);
    },
  });

  useEffect(() => {
    if (!hasMutated.current) {
      hasMutated.current = true;
      mutate({ conceptId: concept.id });
    }
  }, [concept.id, mutate]);

  return (
    <>
      {quiz ? (
        <QuizView
          questions={quiz.questions}
          quizId={quiz.id}
          conceptId={concept.id}
          onComplete={() => {
            redirect(`/concept/${concept.id}`);
          }}
        />
      ) : isPending ? (
        <div className="mt-20 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="ml-3 animate-pulse">Generating your quiz...</span>
        </div>
      ) : isError ? (
        <div className="mt-20 flex items-center justify-center">
          <span className="ml-3 animate-pulse">
            Error generating your quiz.
          </span>
        </div>
      ) : null}
    </>
  );
}
