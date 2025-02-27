"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { type Quiz } from "@/core/concept/types";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface QuizViewProps {
  initialQuiz: Quiz;
  onComplete: () => void;
}

export function QuizView({ initialQuiz, onComplete }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quiz, setQuiz] = useState<Quiz>(initialQuiz);
  const [answer, setAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  // @TODO make this dependent on the quiz state

  //   @ TODO introduce optimistic updates here
  const answerMutation = api.quiz.addUserResponse.useMutation({
    onSuccess: (data) => {
      setQuiz(data);
    },
    onError: () => {
      toast.error("Failed to submit answer. Please try again.");
    },
  });
  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;

    setAnswer(answer);
    setShowExplanation(true);
    answerMutation.mutate({
      questionId: currentQuestion.id,
      answer,
      quizId: quiz.id,
    });
  };

  const handleNext = () => {
    setShowExplanation(false);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setAnswer(null);
  };

  if (!currentQuestion)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1}
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
                      answer === option &&
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

              <NextQuestionButton
                handleNext={handleNext}
                isLoading={answerMutation.isPending}
                onComplete={onComplete}
                isActiveQuiz={quiz.status === "active"}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function NextQuestionButton({
  isLoading,
  handleNext,
  onComplete,
  isActiveQuiz,
}: {
  isLoading: boolean;
  handleNext: () => void;
  onComplete: () => void;
  isActiveQuiz: boolean;
}) {
  if (isLoading)
    return (
      <Button disabled className="mt-6 w-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );

  if (!isActiveQuiz)
    return (
      <Button onClick={onComplete} className="mt-6 w-full">
        Done
      </Button>
    );

  return (
    <Button onClick={handleNext} className="mt-6 w-full">
      Next Question
    </Button>
  );
}
