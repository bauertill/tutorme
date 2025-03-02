import { type QuestionParams } from "@/core/concept/types";

export async function retryUntilValid(
  fn: () => Promise<QuestionParams>,
): Promise<QuestionParams> {
  for (let i = 0; i < 3; i++) {
    const question = await fn();
    const isValidQuestion = question.options.includes(question.correctAnswer);
    if (isValidQuestion) return question;
  }
  throw new Error("Failed to generate a valid question");
}
