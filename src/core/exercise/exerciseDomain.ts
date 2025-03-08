import { llmAdapter } from "../adapters/llmAdapter";

type EvaluationResult = {
  isCorrect: boolean;
  feedback: string;
};

export async function evaluateSolution(exerciseText: string, solutionImage: string): Promise<EvaluationResult> {
  try {
    // Call the LLM adapter to evaluate the solution
    const result = await llmAdapter.exercise.evaluateSolution(exerciseText, solutionImage);
    return result;
  } catch (error) {
    console.error("Error evaluating solution:", error);
    return {
      isCorrect: false,
      feedback: "Error evaluating solution. Please try again.",
    };
  }
}
