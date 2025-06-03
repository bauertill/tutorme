import { type ChatPromptTemplate } from "@langchain/core/prompts";
import { Client } from "langsmith";
import { evaluateSolutionPromptTemplate } from "./assignment/evaluateSolution";
import { explainHintDetailPromptTemplate } from "./assignment/explainHintDetail";
import { extractAssignmentPromptTemplate } from "./assignment/extractAssignmentFromImage";
import {
  consolidateHandwritingPromptTemplate,
  judgeHandwritingPromptTemplate,
} from "./assignment/judgeHandwriting";
import { solveProblemPromptTemplate } from "./assignment/solveProblem";
import { generateReplyPromptTemplate } from "./help/generateReply";
import { handleThumbsDownPromptTemplate } from "./help/handleThumbsDown";
import { recommendQuestionsPromptTemplate } from "./help/recommendQuestions";
// Function to push all prompts to LangSmith
export async function pushPromptsToLangSmith() {
  const client = new Client();
  const promptsByName: Record<string, ChatPromptTemplate> = {
    evaluate_solution: evaluateSolutionPromptTemplate,
    explain_hint_detail: explainHintDetailPromptTemplate,
    extract_assignment: extractAssignmentPromptTemplate,
    solve_problem: solveProblemPromptTemplate,
    recommend_questions: recommendQuestionsPromptTemplate,
    generate_reply: generateReplyPromptTemplate,
    handle_thumbs_down: handleThumbsDownPromptTemplate,
    judge_handwriting: judgeHandwritingPromptTemplate,
    consolidate_handwriting: consolidateHandwritingPromptTemplate,
  };
  const pushPromises = Object.entries(promptsByName).map(
    async ([promptName, promptTemplate]) => {
      try {
        console.log(`Pushing prompt to LangSmith ${promptName}...`);
        // Push the prompt - LangSmith will handle change detection internally
        await client.pushPrompt(promptName, {
          object: promptTemplate,
        });

        console.log(`Prompt ${promptName} pushed to LangSmith successfully`);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("has not changed")
        ) {
          console.log(`No changes detected in ${promptName} prompt`);
          return;
        }
        console.error(
          `Error pushing ${promptName} prompt to LangSmith:`,
          error,
        );
        throw error;
      }
    },
  );

  await Promise.all(pushPromises);
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
