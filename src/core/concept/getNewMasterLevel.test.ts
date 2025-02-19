import { getNewMasteryLevel } from "./conceptDomain";
import { QuestionResponseWithQuestion } from "./types";
import { Question } from "./types";
import "@jest/globals";

describe("getNewMasteryLevel", () => {
  const createMockQuestion = (difficulty: string): Question => ({
    id: "test-id",
    question: "test question",
    options: ["A", "B", "C", "D"],
    correctAnswer: "A",
    difficulty: difficulty as any,
    explanation: "test explanation",
  });

  const createMockResponse = (
    isCorrect: boolean,
    difficulty: string,
    createdAt: Date,
    quizId: string
  ): QuestionResponseWithQuestion => ({
    id: "response-id",
    userId: 1,
    questionId: "test-id",
    answer: "A",
    isCorrect,
    quizId,
    conceptId: "concept-id",
    createdAt,
    updatedAt: new Date(),
    question: createMockQuestion(difficulty),
  });

  it("should return 'unknown' when there are no responses", () => {
    expect(getNewMasteryLevel([])).toBe("unknown");
  });

  it("should return 'beginner' when only beginner questions are answered correctly", () => {
    const responses = [
      createMockResponse(true, "beginner", new Date(), "quiz1"),
      createMockResponse(true, "beginner", new Date(), "quiz1"),
      createMockResponse(false, "intermediate", new Date(), "quiz1"),
    ];
    expect(getNewMasteryLevel(responses)).toBe("beginner");
  });

  it("should return 'intermediate' when beginner and intermediate questions are answered correctly", () => {
    const responses = [
      createMockResponse(true, "beginner", new Date(), "quiz1"),
      createMockResponse(true, "intermediate", new Date(), "quiz1"),
      createMockResponse(false, "advanced", new Date(), "quiz1"),
    ];
    expect(getNewMasteryLevel(responses)).toBe("intermediate");
  });

  it("should return 'advanced' when beginner through advanced questions are answered correctly", () => {
    const responses = [
      createMockResponse(true, "beginner", new Date(), "quiz1"),
      createMockResponse(true, "intermediate", new Date(), "quiz1"),
      createMockResponse(true, "advanced", new Date(), "quiz1"),
      createMockResponse(false, "expert", new Date(), "quiz1"),
    ];
    expect(getNewMasteryLevel(responses)).toBe("advanced");
  });

  it("should return 'expert' when all levels are answered correctly", () => {
    const responses = [
      createMockResponse(true, "beginner", new Date(), "quiz1"),
      createMockResponse(true, "intermediate", new Date(), "quiz1"),
      createMockResponse(true, "advanced", new Date(), "quiz1"),
      createMockResponse(true, "expert", new Date(), "quiz1"),
    ];
    expect(getNewMasteryLevel(responses)).toBe("expert");
  });

  it("should only consider responses from the latest quiz", () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const responses = [
      // Older quiz with all correct answers
      createMockResponse(true, "beginner", oneHourAgo, "quiz1"),
      createMockResponse(true, "intermediate", oneHourAgo, "quiz1"),
      createMockResponse(true, "advanced", oneHourAgo, "quiz1"),
      createMockResponse(true, "expert", oneHourAgo, "quiz1"),
      // Latest quiz with only beginner correct
      createMockResponse(true, "beginner", now, "quiz2"),
      createMockResponse(false, "intermediate", now, "quiz2"),
    ];
    expect(getNewMasteryLevel(responses)).toBe("beginner");
  });
  it("should only consider responses from the latest quiz", () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const responses = [
      // Older quiz with all correct answers
      createMockResponse(true, "beginner", oneHourAgo, "quiz1"),
      createMockResponse(true, "intermediate", oneHourAgo, "quiz1"),
      createMockResponse(false, "advanced", oneHourAgo, "quiz1"),
      createMockResponse(true, "expert", oneHourAgo, "quiz1"),
    ];
    expect(getNewMasteryLevel(responses)).toBe("intermediate");
  });

  it("should return 'unknown' if no questions are answered correctly in latest quiz", () => {
    const responses = [
      createMockResponse(false, "beginner", new Date(), "quiz1"),
      createMockResponse(false, "intermediate", new Date(), "quiz1"),
    ];
    expect(getNewMasteryLevel(responses)).toBe("unknown");
  });
});
