"use client";

import { Question } from "@/core/concept/types";
import { useState } from "react";

interface QuizViewProps {
  questions: Question[];
  userId: number;
  conceptId: string;
  quizId: string;
  onComplete: () => void;
}

export function QuizView({
  questions,
  userId,
  conceptId,
  quizId,
  onComplete,
}: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<
    { questionIndex: number; answer: string }[]
  >([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = async (answer: string) => {
    try {
      setSubmitting(true);
      const response = await fetch("/api/quiz/response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          conceptId,
          questionId: currentQuestion.id,
          answer,
          quizId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit answer");
      }

      const result = await response.json();

      const newAnswers = [
        ...answers,
        { questionIndex: currentQuestionIndex, answer },
      ];
      setAnswers(newAnswers);
      setShowExplanation(true);
    } catch (error) {
      console.error("Error submitting answer:", error);
      // TODO: Add error toast or message
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (isLastQuestion) {
      onComplete();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-400">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
        <span className="px-2 py-1 bg-gray-800 rounded text-sm">
          {currentQuestion.difficulty}
        </span>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-100">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={showExplanation || submitting}
              className={`w-full p-3 text-left rounded-lg transition-colors ${
                showExplanation
                  ? option === currentQuestion.correctAnswer
                    ? "bg-green-900 border-green-500 text-gray-100"
                    : answers[currentQuestionIndex]?.answer === option
                      ? "bg-red-900 border-red-500 text-gray-100"
                      : "bg-gray-800 text-gray-300"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300"
              } border border-gray-700`}
            >
              {option}
            </button>
          ))}

          <button
            onClick={() => handleAnswer("I don't know")}
            disabled={showExplanation || submitting}
            className={`w-full p-3 text-left rounded-lg transition-colors ${
              showExplanation ? "bg-gray-800" : "bg-gray-800 hover:bg-gray-700"
            } border border-gray-700 text-gray-300`}
          >
            I don't know
          </button>
        </div>

        {showExplanation && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h4 className="font-semibold mb-2 text-gray-100">Explanation:</h4>
            <p className="text-gray-300">{currentQuestion.explanation}</p>
          </div>
        )}

        {showExplanation && !isLastQuestion && (
          <button
            onClick={handleNext}
            className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Next Question
          </button>
        )}

        {showExplanation && isLastQuestion && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h4 className="font-semibold mb-2 text-gray-100">Quiz Complete!</h4>
            <button
              onClick={onComplete}
              className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
