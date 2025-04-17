import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Client } from "langsmith";
import { evaluateSolutionPromptTemplate } from "./assignment/evaluateSolution";
import { explainHintDetailPromptTemplate } from "./assignment/explainHintDetail";
// Function to push all prompts to LangSmith
export async function pushPromptsToLangSmith() {
  const client = new Client();
  const promptsByName: Record<string, ChatPromptTemplate> = {
    evaluate_solution: evaluateSolutionPromptTemplate,
    explain_hint_detail: explainHintDetailPromptTemplate,
  };
  for (const [promptName, promptTemplate] of Object.entries(promptsByName)) {
    try {
      console.log(`Pushing prompt to LangSmith ${promptName}...`);
      // Push the prompt - LangSmith will handle change detection internally
      await client.pushPrompt(promptName, {
        object: promptTemplate,
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
}

pushPromptsToLangSmith()
  .then(() => {
    console.log("Prompts pushed to LangSmith successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error pushing prompts to LangSmith:", error);
    process.exit(1);
  });
