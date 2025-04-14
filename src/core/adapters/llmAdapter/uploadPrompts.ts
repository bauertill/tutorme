import { Client } from "langsmith";
import { evaluateSolutionPromptTemplate } from "./assignment/evaluateSolution";

// Function to push all prompts to LangSmith
export async function pushPromptsToLangSmith() {
  const client = new Client();
  const promptName = "evaluate_solution";
  console.log(`Checking for updates to ${promptName} prompt...`);

  try {
    // Push the prompt - LangSmith will handle change detection internally
    await client.pushPrompt(promptName, {
      object: evaluateSolutionPromptTemplate,
      tags: ["system", "evaluation"],
    });

    console.log(`Prompt ${promptName} pushed to LangSmith successfully`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("has not changed")) {
      console.log(`No changes detected in ${promptName} prompt`);
      return;
    }
    console.error(`Error pushing ${promptName} prompt to LangSmith:`, error);
    throw error;
  }
}

await pushPromptsToLangSmith();
