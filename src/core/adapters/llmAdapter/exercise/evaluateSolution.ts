import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model } from "../model";

type EvaluationResult = {
  isCorrect: boolean;
  feedback: string;
};

// Define the system prompt for evaluating exercise solutions
const EVALUATE_SOLUTION_SYSTEM_PROMPT = `You are an expert teacher evaluating a student's solution attempt to an exercise. 
You will be given the exercise text and an image of the student's handwritten or drawn (partial) solution attempt.

Step 1: Write down the student's solution verbatim as seen in the image.
Step 2: Analyze each step of the student's solution attempt and interpret what the student is trying to do. Identify any mistakes or misconceptions.
Step 3: If there is a mistake, write MISTAKE and write down a brief hint to help the student correct this mistake. Otherwise, write NO_MISTAKE.

Keep your output concise.
`;

// Function to evaluate the solution using the multimodal LLM
export async function evaluateSolution(
  exerciseText: string,
  solutionImage: string,
): Promise<EvaluationResult> {
  // Extract the base64 data part (remove the prefix if it exists)
  const base64Data = solutionImage.includes("base64,")
    ? solutionImage.split("base64,")[1]
    : solutionImage;

  // Create messages for the LLM
  const messages = [
    new SystemMessage(EVALUATE_SOLUTION_SYSTEM_PROMPT),
    new HumanMessage({
      content: [
        {
          type: "text",
          text: `\
For the following exercise:\n\n${exerciseText}\n\nHere is the student's (partial) solution attempt:`,
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${base64Data}`,
            detail: "high",
          },
        },
      ],
    }),
  ];

  // Make the call to the multimodal LLM
  const response = await model.invoke(messages);

  // Parse the LLM response to extract the evaluation result
  try {
    // Attempt to identify if the solution is correct and extract feedback
    const responseText = response.content as string;

    // Determine if the solution is correct based on keywords in the response
    const isCorrect =
      responseText.toLowerCase().includes("correct") &&
      !responseText.toLowerCase().includes("not correct") &&
      !responseText.toLowerCase().includes("incorrect");

    return {
      isCorrect,
      feedback: responseText,
    };
  } catch (error) {
    console.error("Error parsing LLM response:", error);
    return {
      isCorrect: false,
      feedback: "Error evaluating solution. Please try again.",
    };
  }
}
