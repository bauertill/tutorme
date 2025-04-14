import { Client } from "langsmith";
import { evaluateSolutionPromptTemplate } from "./assignment/evaluateSolution";

// Function to push all prompts to LangSmith
export async function pushPromptsToLangSmith() {
  const client = new Client();
  console.log("Pushing prompts to LangSmith");

  try {
    await client.pushPrompt("evaluate_solution", {
      object: evaluateSolutionPromptTemplate,
      tags: ["system", "evaluation"],
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error pushing prompts to LangSmith:", error.message);
    } else {
      console.error("Error pushing prompts to LangSmith:", error);
    }
    throw error;
  }
}
