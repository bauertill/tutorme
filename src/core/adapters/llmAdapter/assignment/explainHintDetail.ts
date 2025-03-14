import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { type EvaluationResult } from "../../../assignment/types";
import { model } from "../model";

// Define the system prompt for explaining hints in more detail
const EXPLAIN_HINT_SYSTEM_PROMPT = `You are an expert teacher providing detailed explanations to help students understand concepts they're struggling with.
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
`;

/**
 * Generates a more detailed explanation of a highlighted hint
 * @param problemText The original problem text
 * @param evaluation The evaluation result containing the original hint
 * @param highlightedText The specific text the student highlighted for more explanation
 * @returns A detailed explanation of the highlighted text
 */
export async function explainHintDetail(
  problemText: string,
  evaluation: EvaluationResult,
  highlightedText: string,
): Promise<string> {
  // Create messages for the LLM
  const messages = [
    new SystemMessage(EXPLAIN_HINT_SYSTEM_PROMPT),
    new HumanMessage({
      content: [
        {
          type: "text",
          text: `\
Problem statement:
"""
${problemText}
"""

Evaluation of student's solution:
"""
${evaluation.analysis}
"""

Original hint:
"""
${evaluation.hint ?? "No hint was provided."}
"""

The student has highlighted this specific part for more explanation:
"""
${highlightedText}
"""

Please provide a more detailed explanation of this highlighted text:`,
        },
      ],
    }),
  ];

  // Make the call to the LLM
  const response = await model.invoke(messages);

  // Ensure we're properly converting the content to string
  const content = response.content;
  return typeof content === "string" ? content : JSON.stringify(content);
}
