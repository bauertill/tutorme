import { type LLMAdapter } from "@/core/adapters/llmAdapter";
import { type StudentAssignment } from "@/core/assignment/assignment.types";
import { type Language, LanguageName } from "@/i18n/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { type StudentContext } from "../studentContext.types";

// Define the system prompt template for generating initial assessment
const systemPromptTemplate = SystemMessagePromptTemplate.fromTemplate(
  `You are an expert math teacher creating an initial assessment for a student. 
  
  Your goal is to create 5 math problems that will help assess the student's current level and identify areas where they need support.

  Requirements:
  - Create exactly 5 problems of varying difficulty levels
  - Problems should be appropriate for the student's grade level
  - Include a mix of problem types (algebra, geometry, arithmetic, etc.)
  - Problems should be progressively more challenging
  - Each problem should be self-contained and clearly stated
  - Include reference solutions for each problem
  - Problems should align with the educational standards of the specified country
  - If a textbook is specified, try to align with common topics from that textbook

  Write your response in {language} language only.`,
  {
    name: "generate_initial_assessment_system_prompt",
  },
);

// Define the human message template
const humanPromptTemplate = HumanMessagePromptTemplate.fromTemplate(
  `Create an initial assessment for a student with the following context:
  
  Grade: {grade}
  Country: {country}
  Textbook: {textbook}
  
  Generate 5 math problems that will help assess their current understanding and identify learning gaps.`,
  {
    name: "generate_initial_assessment_human_prompt",
  },
);

// Combine the templates into a single prompt template
export const generateInitialAssessmentPromptTemplate =
  ChatPromptTemplate.fromMessages([systemPromptTemplate, humanPromptTemplate]);

// Define the output schema for a single problem
const AssessmentProblemSchema = z.object({
  problemText: z.string().describe("The problem statement"),
  problemNumber: z
    .string()
    .describe("The problem number (e.g., '1', '2', etc.)"),
  referenceSolution: z.string().describe("The complete solution with steps"),
  difficulty: z
    .enum(["Easy", "Medium", "Hard"])
    .describe("The difficulty level"),
  topic: z
    .string()
    .describe("The main mathematical topic (e.g., 'Algebra', 'Geometry')"),
});

// Define the output schema for the entire assessment
const InitialAssessmentSchema = z.object({
  title: z.string().describe("Title for the assessment"),
  problems: z
    .array(AssessmentProblemSchema)
    .length(5)
    .describe("Exactly 5 assessment problems"),
});

export type InitialAssessmentOutput = z.infer<typeof InitialAssessmentSchema>;

export async function getInitialAssessment(
  studentContext: StudentContext,
  language: Language,
  llmAdapter: LLMAdapter,
): Promise<StudentAssignment> {
  const { grade, country, textbook } = studentContext;

  // Use hub to pull the prompt (fallback to local prompt if not available)
  let prompt;
  try {
    prompt = await llmAdapter.hub.pull("generate_initial_assessment");
  } catch {
    // Fallback to local prompt template
    console.log("No prompt found in hub, using local prompt");
    prompt = generateInitialAssessmentPromptTemplate;
  }

  // Generate the assessment using LLM
  const response = await prompt
    .pipe(llmAdapter.models.model.withStructuredOutput(InitialAssessmentSchema))
    .invoke(
      {
        grade,
        country,
        textbook,
        language: LanguageName[language],
      },
      {
        metadata: {
          functionName: "getInitialAssessment",
          userId: studentContext.userId,
        },
      },
    );

  // Transform the LLM response into a StudentAssignment
  const now = new Date();
  const studentAssignment: StudentAssignment = {
    id: uuidv4(),
    name: response.title,
    createdAt: now,
    updatedAt: now,
    problems: response.problems.map((problem) => ({
      id: uuidv4(),
      problem: problem.problemText,
      problemNumber: problem.problemNumber,
      referenceSolution: problem.referenceSolution,
      createdAt: now,
      updatedAt: now,
    })),
  };

  return studentAssignment;
}
