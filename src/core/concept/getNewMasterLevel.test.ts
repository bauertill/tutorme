import { type Difficulty } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { getNewMasteryLevel } from "./conceptDomain";
import { type Question, type QuestionResponseWithQuestion } from "./types";

describe("getNewMasteryLevel", () => {
  const createMockQuestion = (difficulty: Difficulty): Question => ({
    id: "test-id",
    quizId: "test-quiz-id",
    question: "test question",
    options: ["A", "B", "C", "D"],
    correctAnswer: "A",
    difficulty: difficulty,
    explanation: "test explanation",
  });

  const createMockResponse = (
    isCorrect: boolean,
    difficulty: Difficulty,
    createdAt: Date,
    quizId: string,
  ): QuestionResponseWithQuestion => ({
    id: "response-id",
    userId: "test-user-id",
    questionId: "test-id",
    answer: "A",
    isCorrect,
    quizId,
    conceptId: "concept-id",
    createdAt,
    updatedAt: new Date(),
    question: createMockQuestion(difficulty),
  });

  it("should return 'UNKNOWN' when there are no responses", () => {
    expect(getNewMasteryLevel([])).toBe("UNKNOWN");
  });

  it("should return 'BEGINNER' when only BEGINNER questions are answered correctly", () => {
    const responses = [
      createMockResponse(true, "BEGINNER", new Date(), "quiz1"),
      createMockResponse(true, "BEGINNER", new Date(), "quiz1"),
      createMockResponse(false, "INTERMEDIATE", new Date(), "quiz1"),
    ];
    expect(getNewMasteryLevel(responses)).toBe("BEGINNER");
  });

  it("should return 'INTERMEDIATE' when BEGINNER and INTERMEDIATE questions are answered correctly", () => {
    const responses = [
      createMockResponse(true, "BEGINNER", new Date(), "quiz1"),
      createMockResponse(true, "INTERMEDIATE", new Date(), "quiz1"),
      createMockResponse(false, "ADVANCED", new Date(), "quiz1"),
    ];
    expect(getNewMasteryLevel(responses)).toBe("INTERMEDIATE");
  });

  it("should return 'ADVANCED' when BEGINNER through ADVANCED questions are answered correctly", () => {
    const responses = [
      createMockResponse(true, "BEGINNER", new Date(), "quiz1"),
      createMockResponse(true, "INTERMEDIATE", new Date(), "quiz1"),
      createMockResponse(true, "ADVANCED", new Date(), "quiz1"),
      createMockResponse(false, "EXPERT", new Date(), "quiz1"),
    ];
    expect(getNewMasteryLevel(responses)).toBe("ADVANCED");
  });

  it("should return 'EXPERT' when all levels are answered correctly", () => {
    const responses = [
      createMockResponse(true, "BEGINNER", new Date(), "quiz1"),
      createMockResponse(true, "INTERMEDIATE", new Date(), "quiz1"),
      createMockResponse(true, "ADVANCED", new Date(), "quiz1"),
      createMockResponse(true, "EXPERT", new Date(), "quiz1"),
    ];
    expect(getNewMasteryLevel(responses)).toBe("EXPERT");
  });

  it("should only consider responses from the latest quiz", () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const responses = [
      // Older quiz with all correct answers
      createMockResponse(true, "BEGINNER", oneHourAgo, "quiz1"),
      createMockResponse(true, "INTERMEDIATE", oneHourAgo, "quiz1"),
      createMockResponse(true, "ADVANCED", oneHourAgo, "quiz1"),
      createMockResponse(true, "EXPERT", oneHourAgo, "quiz1"),
      // Latest quiz with only BEGINNER correct
      createMockResponse(true, "BEGINNER", now, "quiz2"),
      createMockResponse(false, "INTERMEDIATE", now, "quiz2"),
    ];
    expect(getNewMasteryLevel(responses)).toBe("BEGINNER");
  });
  it("should only consider responses from the latest quiz", () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const responses = [
      // Older quiz with all correct answers
      createMockResponse(true, "BEGINNER", oneHourAgo, "quiz1"),
      createMockResponse(true, "INTERMEDIATE", oneHourAgo, "quiz1"),
      createMockResponse(false, "ADVANCED", oneHourAgo, "quiz1"),
      createMockResponse(true, "EXPERT", oneHourAgo, "quiz1"),
    ];
    expect(getNewMasteryLevel(responses)).toBe("INTERMEDIATE");
  });

  it("should return 'UNKNOWN' if no questions are answered correctly in latest quiz", () => {
    const responses = [
      createMockResponse(false, "BEGINNER", new Date(), "quiz1"),
      createMockResponse(false, "INTERMEDIATE", new Date(), "quiz1"),
    ];
    expect(getNewMasteryLevel(responses)).toBe("UNKNOWN");
  });
});
