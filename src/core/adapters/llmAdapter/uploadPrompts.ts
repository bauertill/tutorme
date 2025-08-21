import { solveProblemPromptTemplate } from "@/core/problem/llm/solveProblem";
import { generateInitialAssessmentPromptTemplate } from "@/core/studentContext/llm/getInitialAssesment";
import { evaluateSolutionPromptTemplate } from "@/core/studentSolution/llm/evaluateSolution";
import { explainHintDetailPromptTemplate } from "@/core/studentSolution/llm/explainHintDetail";
import {
  consolidateHandwritingPromptTemplate,
  judgeHandwritingPromptTemplate,
} from "@/core/studentSolution/llm/judgeHandwriting";
import { type ChatPromptTemplate } from "@langchain/core/prompts";
import { Client } from "langsmith";
import { generateReplyPromptTemplate } from "../../help/llm/generateReply";
import { handleThumbsDownPromptTemplate } from "../../help/llm/handleThumbsDown";
import { recommendQuestionsPromptTemplate } from "../../help/llm/recommendQuestions";
// Function to push all prompts to LangSmith
export async function pushPromptsToLangSmith() {
  const client = new Client();
  const promptsByName: Record<string, ChatPromptTemplate> = {
    evaluate_solution: evaluateSolutionPromptTemplate,
    explain_hint_detail: explainHintDetailPromptTemplate,
    solve_problem: solveProblemPromptTemplate,
    recommend_questions: recommendQuestionsPromptTemplate,
    generate_reply: generateReplyPromptTemplate,
    handle_thumbs_down: handleThumbsDownPromptTemplate,
    judge_handwriting: judgeHandwritingPromptTemplate,
    consolidate_handwriting: consolidateHandwritingPromptTemplate,
    generate_initial_assessment: generateInitialAssessmentPromptTemplate,
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
