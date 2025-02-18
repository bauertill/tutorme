"use client";

import { Question } from "@/core/concept/types";
import { useState } from "react";

interface QuizViewProps {
  questions: Question[];
  onComplete: (results: { questionIndex: number; answer: string }[]) => void;
}

export function QuizView({ questions, onComplete }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<
    { questionIndex: number; answer: string }[]
  >([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = (answer: string) => {
    const newAnswers = [
      ...answers,
      { questionIndex: currentQuestionIndex, answer },
    ];
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (isLastQuestion) {
      onComplete(answers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
        <span className="px-2 py-1 bg-gray-100 rounded text-sm">
          {currentQuestion.difficulty}
        </span>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={showExplanation}
              className={`w-full p-3 text-left rounded-lg transition-colors ${
                showExplanation
                  ? option === currentQuestion.correctAnswer
                    ? "bg-green-100 border-green-500"
                    : answers[currentQuestionIndex]?.answer === option
                      ? "bg-red-100 border-red-500"
                      : "bg-gray-50"
                  : "bg-gray-50 hover:bg-gray-100"
              } border`}
            >
              {option}
            </button>
          ))}

          <button
            onClick={() => handleAnswer("I don't know")}
            disabled={showExplanation}
            className={`w-full p-3 text-left rounded-lg transition-colors ${
              showExplanation ? "bg-gray-50" : "bg-gray-50 hover:bg-gray-100"
            } border`}
          >
            I don't know
          </button>
        </div>

        {showExplanation && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Explanation:</h4>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}

        {showExplanation && (
          <button
            onClick={handleNext}
            className="mt-6 w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {isLastQuestion ? "Complete Quiz" : "Next Question"}
          </button>
        )}
      </div>
    </div>
  );
}
