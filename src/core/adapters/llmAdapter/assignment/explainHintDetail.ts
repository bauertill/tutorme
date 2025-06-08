import { type EvaluationResult } from "@/core/studentSolution/studentSolution.types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import * as hub from "langchain/hub";
import { z } from "zod";
import { model } from "../model";

// Define the system prompt template for explaining hints in more detail
const systemPromptTemplate = SystemMessagePromptTemplate.fromTemplate(
  `You are an expert teacher providing detailed explanations to help students understand concepts they're struggling with.
You will be given:
1. The original problem statement
2. An evaluation of the student's solution, including any hints already provided
3. A specific part of the hint or feedback that the student has highlighted because they don't understand it

Your task is to:
- Provide a more detailed explanation of the highlighted text
- Break down complex concepts into simpler terms
- Use examples if appropriate to illustrate the concept
- Ensure your explanation is clear, concise, and helpful

Always wrap LaTeX in the appropriate delimiters.
Do not start your response with "Certainly!" or any other greeting, get straight to explaining the hint.
`,
  {
    name: "explain_hint_detail_system_prompt",
  },
);

// Define the human message template
const humanPromptTemplate = HumanMessagePromptTemplate.fromTemplate(
  `\
Problem statement:
"""
{problemText}
"""

Evaluation of student's solution:
"""
{analysis}
"""

Original hint:
"""
{hint}
"""

The student has highlighted this specific part for more explanation:
"""
{highlightedText}
"""

Please provide a more detailed explanation of this highlighted text:`,
  {
    name: "explain_hint_detail_human_prompt",
  },
);

// Combine the templates into a single prompt template
export const explainHintDetailPromptTemplate = ChatPromptTemplate.fromMessages([
  systemPromptTemplate,
  humanPromptTemplate,
]);

// Define the output schema
export const ExplainHintDetailSchema = z.object({
  explanation: z
    .string()
    .describe("A detailed explanation of the highlighted text"),
});

export type ExplainHintDetailInput = {
  problemId: string;
  problemText: string;
  evaluation: EvaluationResult;
  highlightedText: string;
};

/**
 * Generates a more detailed explanation of a highlighted hint
 * @param problemText The original problem text
 * @param evaluation The evaluation result containing the original hint
 * @param highlightedText The specific text the student highlighted for more explanation
 * @returns A detailed explanation of the highlighted text
 */
export async function explainHintDetail(
  input: ExplainHintDetailInput,
): Promise<string> {
  const { problemId, problemText, evaluation, highlightedText } = input;

  // Use hub to pull the prompt
  const prompt = await hub.pull("explain_hint_detail");

  // Invoke the model with structured output
  const response = await prompt
    .pipe(model.withStructuredOutput(ExplainHintDetailSchema))
    .invoke(
      {
        problemText,
        analysis: evaluation.analysis,
        hint: evaluation.hint ?? "No hint was provided.",
        highlightedText,
      },
      {
        metadata: {
          functionName: "explainHintDetail",
          problemId,
        },
      },
    );

  return response.explanation;
}
