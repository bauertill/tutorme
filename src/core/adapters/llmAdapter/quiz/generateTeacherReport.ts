import {
  type Concept,
  type QuestionResponseWithQuestion,
} from "@/core/concept/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { model } from "../model";

export const TEACHER_REPORT_SYSTEM_PROMPT = `You are an expert educational AI assistant tasked with analyzing a student's quiz performance and generating a structured teacher report.

Your goal is to provide a comprehensive analysis that:
1. Identifies the student's strengths and areas of mastery
2. Pinpoints specific knowledge gaps and misconceptions
3. Recommends targeted learning activities`;

export const TEACHER_REPORT_HUMAN_TEMPLATE = `Generate a comprehensive teacher report for a student who has completed a quiz on the concept: {conceptName}.

Concept description: {conceptDescription}

Quiz performance:
{questionsAndResponses}

Please analyze the student's performance and generate a structured report.


   - Gives an overall performance assessment in one sentence
   - States one key strength in one sentence
   - Identifies one main area to improve in one sentence
   - Suggests one clear next step in one sentence
   
.`;

/**
 * Generate a comprehensive teacher report after a quiz is completed
 * @param concept The concept that was tested in the quiz
 * @param userResponses All user responses for this quiz
 * @returns Promise with a teacher report as a string
 */
export async function generateTeacherReport(
  concept: Concept,
  userResponses: QuestionResponseWithQuestion[],
): Promise<string> {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(TEACHER_REPORT_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.fromTemplate(TEACHER_REPORT_HUMAN_TEMPLATE),
  ]);

  const chain = promptTemplate.pipe(model);

  const questionsAndResponses = userResponses
    .map(
      (response) =>
        `question: ${response.question.question}\ndifficulty: ${response.question.difficulty}\nresponse: ${response.answer}\nisCorrect: ${response.isCorrect}\nexplanation: ${response.question.explanation}`,
    )
    .join("\n\n");

  const response = await chain.invoke(
    {
      conceptName: concept.name,
      conceptDescription: concept.description,
      questionsAndResponses,
    },
    {
      metadata: {
        conceptId: concept.id,
      },
    },
  );

  // Convert the response to a string
  return response.content instanceof Object
    ? JSON.stringify(response.content)
    : String(response.content).trim();
}
