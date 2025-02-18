import { DBAdapter } from "../adapters/dbAdapter";
import { LLMAdapter } from "../adapters/llmAdapter";
import { Concept } from "../goal/types";
import { Quiz } from "./types";

//   async function evaluateKnowledge(concept: Concept): Promise<Question[]> {
//     try {
//       const response = await this.evaluationChain.invoke({
//         conceptName: concept.name,
//         conceptDescription: concept.description,
//       });

//       return response.questions;
//     } catch (error) {
//       console.error("Error generating concept evaluation:", error);
//       throw new Error("Failed to generate concept evaluation");
//     }
//   }

export async function createKnowledgeQuizAndStoreInDB(
  concept: Concept,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter
): Promise<Quiz> {
  try {
    const questions = await llmAdapter.createKnowledgeQuiz(concept);
    const quiz = await dbAdapter.createQuiz(questions, concept.id);
    return quiz;
  } catch (error) {
    console.error("Error creating and storing quiz:", error);
    throw new Error("Failed to create and store quiz");
  }
}
