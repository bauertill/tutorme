import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { model } from "../model";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

type EvaluationResult = {
  isCorrect: boolean;
  feedback: string;
};

// Define the system prompt for evaluating exercise solutions
const EVALUATE_SOLUTION_SYSTEM_PROMPT = `You are an expert teacher evaluating a student's solution to an exercise. 
You will be given the exercise text and an image of the student's handwritten or drawn solution.
Carefully analyze the solution and determine whether it is correct or not.
Provide detailed feedback on the solution, explaining what the student did right and what they could improve.
Be encouraging but honest in your feedback.`;

// Function to evaluate the solution using the multimodal LLM
export async function evaluateSolution(
  exerciseText: string,
  solutionImage: string
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
          text: `Please evaluate this solution for the following exercise:\n\n${exerciseText}\n\nHere is the student's solution:`,
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${base64Data}`,
            detail: "high",
          },
        },
        {
          type: "text",
          text: "Based on the exercise and the solution image, is the solution correct? Provide detailed feedback.",
        },
      ],
    }),
  ];

  // Make the call to the multimodal LLM
  const response = await model.invoke(messages);

  // Parse the LLM response to extract the evaluation result
  try {
    // Attempt to identify if the solution is correct and extract feedback
    const responseText = response.content.toString();
    
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