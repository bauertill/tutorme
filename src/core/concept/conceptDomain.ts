import { PrismaClient } from "@prisma/client";
import { LLMAdapter } from "../adapters/llmAdapter";
import { Concept } from "../goal/types";

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
  prisma: PrismaClient,
  llmAdapter: LLMAdapter
) {
  try {
    const questions = await llmAdapter.createKnowledgeQuiz(concept);
    const quiz = await prisma.quiz.create({
      data: {
        conceptId: concept.id,
        questions: {
          create: questions,
        },
      },
      include: {
        questions: true,
      },
    });
    return quiz;
  } catch (error) {
    console.error("Error creating and storing quiz:", error);
    throw new Error("Failed to create and store quiz");
  }
}
