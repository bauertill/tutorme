"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { type Question } from "@/core/concept/types";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { useState } from "react";

interface QuizViewProps {
  questions: Question[];
  conceptId: string;
  quizId: string;
  onComplete: () => void;
}

export function QuizView({
  questions,
  conceptId,
  quizId,
  onComplete,
}: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<
    { questionIndex: number; answer: string }[]
  >([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  //   @ TODO introduce optimistic updates here
  const answerMutation = api.quiz.addUserResponse.useMutation({
    onSuccess: (_, variables) => {
      const newAnswers = [
        ...answers,
        { questionIndex: currentQuestionIndex, answer: variables.answer },
      ];
      setAnswers(newAnswers);
      setShowExplanation(true);
    },
    onError: (error) => {
      console.error("Error submitting answer:", error);
      // TODO: Add error toast or message
    },
  });

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;
    answerMutation.mutate({
      conceptId,
      questionId: currentQuestion.id,
      answer,
      quizId,
    });
  };

  const handleNext = () => {
    setShowExplanation(false);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  if (!currentQuestion) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
        <Badge variant="outline">{currentQuestion.difficulty}</Badge>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">{currentQuestion.question}</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={showExplanation || answerMutation.isPending}
                variant="outline"
                className={cn(
                  "w-full justify-start",
                  "disabled:opacity-100",
                  showExplanation && {
                    "border-green-600 bg-green-600/20 text-green-900":
                      option === currentQuestion.correctAnswer,
                    "border-red-600 bg-red-600/20 text-red-900":
                      answers[currentQuestionIndex]?.answer === option &&
                      option !== currentQuestion.correctAnswer,
                  },
                )}
              >
                {option}
              </Button>
            ))}

            <Button
              onClick={() => handleAnswer("I don&apos;t know")}
              disabled={showExplanation || answerMutation.isPending}
              variant="outline"
              className="w-full justify-start disabled:opacity-100"
            >
              I don&apos;t know
            </Button>
          </div>

          {showExplanation && (
            <>
              <div className="space-y-2">
                <h4 className="mb-2 font-semibold">Explanation:</h4>
                <p className="text-muted-foreground">
                  {currentQuestion.explanation}
                </p>
              </div>

              {!isLastQuestion ? (
                <Button onClick={handleNext} className="mt-6 w-full">
                  Next Question
                </Button>
              ) : (
                <div className="space-y-2">
                  <h4 className="mb-2 font-semibold">Quiz Complete!</h4>
                  <Button onClick={onComplete} className="mt-4 w-full">
                    Done
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
